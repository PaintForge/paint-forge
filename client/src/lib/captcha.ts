// Simple math-based captcha utility
export interface CaptchaData {
  question: string;
  answer: number;
}

export function generateCaptcha(): CaptchaData {
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1: number;
  let num2: number;
  let answer: number;
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 50) + 51; // Ensure positive result
      num2 = Math.floor(Math.random() * 50) + 1;
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
      break;
    default:
      num1 = 5;
      num2 = 3;
      answer = 8;
  }
  
  return {
    question: `${num1} ${operation} ${num2} = ?`,
    answer
  };
}