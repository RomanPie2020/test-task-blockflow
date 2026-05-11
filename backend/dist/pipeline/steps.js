const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const validateInputStep = async (context) => {
    await delay(800);
    if (!context.selectedOption || context.numberValue <= 0) {
        throw new Error("Invalid payload for pipeline");
    }
};
export const transformDataStep = async () => {
    await delay(1000);
};
export const finalizeStep = async () => {
    await delay(900);
};
export function createPipeline() {
    return [validateInputStep, transformDataStep, finalizeStep];
}
