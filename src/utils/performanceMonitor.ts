// 性能监控工具
interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100; // 最多保存100条记录

  /**
   * 开始监控一个操作
   */
  startOperation(operation: string): string {
    const id = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.metrics.push({
      operation,
      startTime: performance.now(),
      success: false,
    });

    // 清理旧记录
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    return id;
  }

  /**
   * 结束监控一个操作
   */
  endOperation(id: string, success: boolean = true, error?: string): void {
    const metric = this.metrics.find(m => m.operation === id.split('_')[0] && !m.endTime);

    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.success = success;
      metric.error = error;
    }
  }

  /**
   * 获取操作的平均响应时间
   */
  getAverageDuration(operation: string): number {
    const operationMetrics = this.metrics.filter(
      m => m.operation === operation && m.duration !== undefined
    );

    if (operationMetrics.length === 0) return 0;

    const totalDuration = operationMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalDuration / operationMetrics.length;
  }

  /**
   * 获取操作的成功率
   */
  getSuccessRate(operation: string): number {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);

    if (operationMetrics.length === 0) return 0;

    const successCount = operationMetrics.filter(m => m.success).length;
    return (successCount / operationMetrics.length) * 100;
  }

  /**
   * 获取最近的性能指标
   */
  getRecentMetrics(operation?: string, limit: number = 10): PerformanceMetric[] {
    let filteredMetrics = this.metrics;

    if (operation) {
      filteredMetrics = this.metrics.filter(m => m.operation === operation);
    }

    return filteredMetrics
      .filter(m => m.duration !== undefined)
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))
      .slice(0, limit);
  }

  /**
   * 清理性能指标
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    totalOperations: number;
    averageResponseTime: number;
    successRate: number;
    slowestOperations: PerformanceMetric[];
    failedOperations: PerformanceMetric[];
  } {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined);

    if (completedMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageResponseTime: 0,
        successRate: 0,
        slowestOperations: [],
        failedOperations: [],
      };
    }

    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageResponseTime = totalDuration / completedMetrics.length;
    const successCount = completedMetrics.filter(m => m.success).length;
    const successRate = (successCount / completedMetrics.length) * 100;

    const slowestOperations = completedMetrics
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);

    const failedOperations = completedMetrics.filter(m => !m.success);

    return {
      totalOperations: completedMetrics.length,
      averageResponseTime,
      successRate,
      slowestOperations,
      failedOperations,
    };
  }
}

// 导出单例实例
export const performanceMonitor = new PerformanceMonitor();

// 便捷的装饰器函数
export function monitorPerformance<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const id = performanceMonitor.startOperation(operation);

    try {
      const result = await fn(...args);
      performanceMonitor.endOperation(id, true);
      return result;
    } catch (error) {
      performanceMonitor.endOperation(
        id,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  };
}

// 同步版本的监控装饰器
export function monitorPerformanceSync<T extends any[], R>(
  operation: string,
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    const id = performanceMonitor.startOperation(operation);

    try {
      const result = fn(...args);
      performanceMonitor.endOperation(id, true);
      return result;
    } catch (error) {
      performanceMonitor.endOperation(
        id,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  };
}
