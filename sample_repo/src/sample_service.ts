// Sample TypeScript Service demonstrating intentional smell patterns for detector testing

export interface UserSession {
  userId: string;
  role: string;
}

// 1. @ts-ignore usage
// @ts-ignore
const unverifiedConfig: any = { mode: "debug" };

export function authenticateUser(inputToken: any): boolean {
  // 2. Loose equality check
  if (inputToken == "admin_secret") {
    // 3. Leftover console.log
    console.log("Admin logged in successfully");
    return true;
  }

  try {
    // 4. Dangerous eval execution
    const evaluated = eval(`JSON.parse('${inputToken}')`);
    return Boolean(evaluated);
  } catch (err) {
    // 5. Empty catch block
  }

  return false;
}
