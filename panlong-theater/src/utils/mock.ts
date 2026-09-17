// 模拟网络延迟（200-600ms）
export function mockDelay(ms: number = 300 + Math.random() * 400): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 模拟偶尔失败（约 3% 概率）
export function mockRandomFailure(errorRate: number = 0.03): void {
  if (Math.random() < errorRate) {
    throw new Error('网络异常，请稍后重试');
  }
}

// 包装模拟 API 调用
export async function mockApi<T>(data: T, delayMs?: number): Promise<T> {
  await mockDelay(delayMs);
  mockRandomFailure();
  return JSON.parse(JSON.stringify(data)); // 深拷贝避免引用污染
}
