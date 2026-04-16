"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { OnboardingData, WritingPreferences, SpecialtyField, SpecialtySettings } from "@/types/onboarding";
import { SPECIALTY_FIELDS, SPECIALTY_SPECIFIC_QUESTIONS } from "@/data/specialty-onboarding";
import { SpecialtyFieldsStep } from "./steps/SpecialtyFieldsStep";
import { WritingPreferencesStep } from "./steps/WritingPreferencesStep";
import { SpecialtySettingsStep } from "./steps/SpecialtySettingsStep";
import { UploadStyleStep } from "./steps/UploadStyleStep";
import { CompletedStep } from "./steps/CompletedStep";

interface OnboardingFlowProps {
  userProfile: {
    id: string;
    name: string;
    specialty: string;
  };
}

export function OnboardingFlow({ userProfile }: OnboardingFlowProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSpecialtyQuestions = !!SPECIALTY_SPECIFIC_QUESTIONS[userProfile.specialty];
  const totalSteps = hasSpecialtyQuestions ? 5 : 4;

  const [currentStep, setCurrentStep] = useState(1);

  const initialFields = (SPECIALTY_FIELDS[userProfile.specialty] || SPECIALTY_FIELDS["Clínica Geral"])
    .map((f) => ({ ...f, enabled: true, isCustom: false }));

  const [data, setData] = useState<OnboardingData>({
    step: 1,
    specialtyFields: initialFields,
    writingPreferences: {
      tone: "formal",
      planFormat: "numbered_list",
      includeDateTime: true,
      includeDuration: false,
      includeSuggestedCID: true,
      includeSuggestedReturn: true,
    },
    specialtySettings: {},
    uploadedFiles: [],
  });

  const handleNext = () => { if (currentStep < totalSteps) setCurrentStep((s) => s + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep((s) => s - 1); };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialtyFields: data.specialtyFields.filter((f) => f.enabled),
          writingPreferences: data.writingPreferences,
          specialtySettings: data.specialtySettings,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map step number to component
  function getStepContent() {
    if (currentStep === 1) {
      return (
        <SpecialtyFieldsStep
          specialty={userProfile.specialty}
          fields={data.specialtyFields}
          onUpdate={(fields: SpecialtyField[]) => setData((d) => ({ ...d, specialtyFields: fields }))}
        />
      );
    }
    if (currentStep === 2) {
      return (
        <WritingPreferencesStep
          preferences={data.writingPreferences}
          onUpdate={(prefs: WritingPreferences) => setData((d) => ({ ...d, writingPreferences: prefs }))}
        />
      );
    }
    if (currentStep === 3 && hasSpecialtyQuestions) {
      return (
        <SpecialtySettingsStep
          specialty={userProfile.specialty}
          settings={data.specialtySettings}
          onUpdate={(s: SpecialtySettings) => setData((d) => ({ ...d, specialtySettings: s }))}
        />
      );
    }
    const uploadStep = hasSpecialtyQuestions ? 4 : 3;
    const completeStep = hasSpecialtyQuestions ? 5 : 4;
    if (currentStep === uploadStep) {
      return (
        <UploadStyleStep
          files={data.uploadedFiles ?? []}
          onUpdate={(files) => setData((d) => ({ ...d, uploadedFiles: files }))}
        />
      );
    }
    if (currentStep === completeStep) {
      return <CompletedStep userName={userProfile.name} />;
    }
    return null;
  }

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex min-h-screen flex-col bg-[#f0ede6]">
      {/* Header */}
      <div className="p-6">
        <span className="font-serif text-2xl italic text-hiro-text">hiro.</span>
      </div>

      {/* Progress */}
      <div className="px-6 mb-8">
        <div className="mx-auto max-w-xl">
          <div className="mb-2 flex items-center justify-between text-[12px] text-hiro-muted">
            <span>Passo {currentStep} de {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <motion.div
              className="h-full rounded-full bg-hiro-green"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        <div className="mx-auto max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {getStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-black/[0.06] bg-white/60 p-6">
        <div className="mx-auto flex max-w-xl justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 text-[14px] text-hiro-muted transition-colors hover:text-hiro-text disabled:opacity-30"
          >
            Voltar
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
              className="rounded-full bg-hiro-green px-8 py-3 text-[14px] font-medium text-white transition-all hover:bg-[#244a3b] disabled:opacity-50"
            >
              {isSubmitting ? "Salvando..." : "Começar a usar o hiro"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-hiro-green px-8 py-3 text-[14px] font-medium text-white transition-all hover:bg-[#244a3b]"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
