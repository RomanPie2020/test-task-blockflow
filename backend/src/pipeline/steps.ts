type PipelineContext = {
  selectedOption: string;
  numberValue: number;
};

export type PipelineStep = (context: PipelineContext) => Promise<void>;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const validateInputStep: PipelineStep = async (context) => {
  await delay(800);
  if (!context.selectedOption || context.numberValue <= 0) {
    throw new Error("Invalid payload for pipeline");
  }
};

export const transformDataStep: PipelineStep = async () => {
  await delay(1000);
};

export const finalizeStep: PipelineStep = async () => {
  await delay(900);
};

export function createPipeline(): PipelineStep[] {
  return [validateInputStep, transformDataStep, finalizeStep];
}
