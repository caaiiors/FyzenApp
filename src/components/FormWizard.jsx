import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import Card from "./Card";

export default function FormWizard({ steps, onComplete, initialData = {}, loading = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = steps[currentStep].validate 
    ? steps[currentStep].validate(formData)
    : true;

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                  ${idx < currentStep 
                    ? 'bg-primary-500 text-white' 
                    : idx === currentStep 
                      ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' 
                      : 'bg-slate-800 text-slate-400'
                  }
                `}>
                  {idx < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-xs hidden md:block ${
                  idx === currentStep ? 'text-white font-medium' : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                  idx < currentStep ? 'bg-primary-500' : 'bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mt-4">
          <h3 className="text-xl md:text-2xl font-bold text-white">
            {steps[currentStep].title}
          </h3>
          {steps[currentStep].description && (
            <p className="text-sm text-slate-400 mt-1">
              {steps[currentStep].description}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <CurrentStepComponent 
            data={formData} 
            updateField={updateField}
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Voltar</span>
        </button>

        <span className="text-sm text-slate-500">
          Etapa {currentStep + 1} de {steps.length}
        </span>

        <button
          onClick={handleNext}
          disabled={!canProceed || loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Gerando...
            </>
          ) : (
            <>
              <span>
                {currentStep === steps.length - 1 ? 'Gerar Plano' : 'Próximo'}
              </span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-5 h-5" />}
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
