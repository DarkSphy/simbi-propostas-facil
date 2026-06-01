/**
 * Translate technical errors (like network drop, Failed to fetch) into user-friendly messages.
 */
export function getErrorMessage(error: any, defaultMsg = "Ocorreu um erro."): string {
  if (!error) return defaultMsg;

  const msg = typeof error === 'string' ? error : (error.message || error.msg || error.error_description || defaultMsg);

  const lowerMsg = msg.toLowerCase();

  // Network / Connectivity errors
  if (
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("network error") ||
    lowerMsg.includes("network request failed") ||
    lowerMsg.includes("offline") ||
    lowerMsg.includes("timeout")
  ) {
    return "Você parece estar sem internet. Verifique sua conexão e tente novamente.";
  }

  // Supabase specific generic errors
  if (lowerMsg.includes("jwt expired")) {
    return "Sua sessão expirou. Por favor, faça login novamente.";
  }

  // Return the original message if no specific match
  return msg;
}
