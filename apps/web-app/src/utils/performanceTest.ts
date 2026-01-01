// Performance testing utilities for Academia Hub Desktop

interface PerformanceTestResult {
  testName: string;
  duration: number;
  success: boolean;
  details?: any;
  timestamp: number;
}

interface BundleAnalysis {
  totalSize: number;
  chunkSizes: Record<string, number>;
  loadTimes: Record<string, number>;
  cacheEfficiency: number;
}

class PerformanceTester {
  private results: PerformanceTestResult[] = [];
  private startTime: number = 0;

  // Start timing
  start(testName: string): void {
    this.startTime = performance.now();
    console.log(`🚀 Starting performance test: ${testName}`);
  }

  // End timing and record result
  end(testName: string, success: boolean = true, details?: any): PerformanceTestResult {
    const duration = performance.now() - this.startTime;
    const result: PerformanceTestResult = {
      testName,
      duration,
      success,
      details,
      timestamp: Date.now()
    };

    this.results.push(result);
    console.log(`✅ Performance test completed: ${testName} (${duration.toFixed(2)}ms)`);
    
    return result;
  }

  // Test module load time
  async testModuleLoad(moduleName: string, importFn: () => Promise<any>): Promise<PerformanceTestResult> {
    this.start(`Module Load: ${moduleName}`);
    
    try {
      const startTime = performance.now();
      await importFn();
      const loadTime = performance.now() - startTime;
      
      return this.end(`Module Load: ${moduleName}`, true, { loadTime });
    } catch (error) {
      return this.end(`Module Load: ${moduleName}`, false, { error: error.message });
    }
  }

  // Test bundle size
  async testBundleSize(): Promise<BundleAnalysis> {
    this.start('Bundle Size Analysis');
    
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      
      const chunkSizes: Record<string, number> = {};
      const loadTimes: Record<string, number> = {};
      let totalSize = 0;

      jsResources.forEach(resource => {
        const chunkName = this.extractChunkName(resource.name);
        const size = resource.transferSize || 0;
        
        chunkSizes[chunkName] = (chunkSizes[chunkName] || 0) + size;
        loadTimes[chunkName] = resource.duration;
        totalSize += size;
      });

      const cacheEfficiency = this.calculateCacheEfficiency(resources);

      const analysis: BundleAnalysis = {
        totalSize,
        chunkSizes,
        loadTimes,
        cacheEfficiency
      };

      this.end('Bundle Size Analysis', true, analysis);
      return analysis;
    } catch (error) {
      this.end('Bundle Size Analysis', false, { error: error.message });
      throw error;
    }
  }

  // Test lazy loading performance
  async testLazyLoading(): Promise<PerformanceTestResult> {
    this.start('Lazy Loading Performance');
    
    try {
      const moduleTests = [
        { name: 'Students', importFn: () => import('../components/dashboard/Students') },
        { name: 'Finance', importFn: () => import('../components/dashboard/Finance') },
        { name: 'HR', importFn: () => import('../components/dashboard/HR') },
        { name: 'Planning', importFn: () => import('../components/dashboard/Planning') },
        { name: 'Examinations', importFn: () => import('../../modules/examens') }
      ];

      const results = await Promise.allSettled(
        moduleTests.map(test => this.testModuleLoad(test.name, test.importFn))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const total = results.length;
      const successRate = (successful / total) * 100;

      return this.end('Lazy Loading Performance', successRate > 80, {
        successRate,
        totalModules: total,
        successfulModules: successful,
        results: results.map(r => r.status === 'fulfilled' ? r.value : null)
      });
    } catch (error) {
      return this.end('Lazy Loading Performance', false, { error: error.message });
    }
  }

  // Test preloading performance
  async testPreloading(): Promise<PerformanceTestResult> {
    this.start('Preloading Performance');
    
    try {
      // Simulate preloading high-priority modules
      const highPriorityModules = [
        () => import('../components/dashboard/Students'),
        () => import('../components/dashboard/Finance'),
        () => import('../components/dashboard/HR')
      ];

      const startTime = performance.now();
      await Promise.all(highPriorityModules.map(importFn => importFn()));
      const preloadTime = performance.now() - startTime;

      // Test cache hit rate
      const secondLoadStart = performance.now();
      await Promise.all(highPriorityModules.map(importFn => importFn()));
      const secondLoadTime = performance.now() - secondLoadStart;

      const cacheEfficiency = ((preloadTime - secondLoadTime) / preloadTime) * 100;

      return this.end('Preloading Performance', true, {
        preloadTime,
        secondLoadTime,
        cacheEfficiency,
        modulesPreloaded: highPriorityModules.length
      });
    } catch (error) {
      return this.end('Preloading Performance', false, { error: error.message });
    }
  }

  // Test overall application performance
  async testApplicationPerformance(): Promise<PerformanceTestResult> {
    this.start('Application Performance');
    
    try {
      // Test navigation performance
      const navigationStart = performance.now();
      // Simulate navigation between modules
      await this.simulateNavigation();
      const navigationTime = performance.now() - navigationStart;

      // Test memory usage
      const memoryUsage = this.getMemoryUsage();

      // Test render performance
      const renderStart = performance.now();
      await this.testRenderPerformance();
      const renderTime = performance.now() - renderStart;

      return this.end('Application Performance', true, {
        navigationTime,
        renderTime,
        memoryUsage,
        totalTime: navigationTime + renderTime
      });
    } catch (error) {
      return this.end('Application Performance', false, { error: error.message });
    }
  }

  // Run all performance tests
  async runAllTests(): Promise<PerformanceTestResult[]> {
    console.log('🧪 Starting comprehensive performance tests...');
    
    try {
      await this.testLazyLoading();
      await this.testPreloading();
      await this.testBundleSize();
      await this.testApplicationPerformance();

      console.log('✅ All performance tests completed!');
      this.generateReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Performance tests failed:', error);
      return this.results;
    }
  }

  // Generate performance report
  generateReport(): void {
    const successful = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const averageTime = this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    console.log('\n📊 PERFORMANCE TEST REPORT');
    console.log('========================');
    console.log(`Total Tests: ${total}`);
    console.log(`Successful: ${successful}`);
    console.log(`Success Rate: ${((successful / total) * 100).toFixed(1)}%`);
    console.log(`Average Time: ${averageTime.toFixed(2)}ms`);
    console.log('\nDetailed Results:');
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testName}: ${result.duration.toFixed(2)}ms`);
      if (result.details) {
        console.log(`   Details:`, result.details);
      }
    });
  }

  // Helper methods
  private extractChunkName(url: string): string {
    const match = url.match(/([^/]+)\.js$/);
    return match ? match[1] : 'unknown';
  }

  private calculateCacheEfficiency(resources: PerformanceResourceTiming[]): number {
    const cachedResources = resources.filter(r => r.transferSize === 0);
    return (cachedResources.length / resources.length) * 100;
  }

  private getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return { used: 0, total: 0, limit: 0 };
  }

  private async simulateNavigation(): Promise<void> {
    // Simulate navigation delays
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async testRenderPerformance(): Promise<void> {
    // Simulate render operations
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Get all results
  getResults(): PerformanceTestResult[] {
    return [...this.results];
  }

  // Clear results
  clearResults(): void {
    this.results = [];
  }
}

// Export singleton instance
export const performanceTester = new PerformanceTester();

// Export utility functions
export const runPerformanceTests = () => performanceTester.runAllTests();
export const testModuleLoad = (moduleName: string, importFn: () => Promise<any>) => 
  performanceTester.testModuleLoad(moduleName, importFn);
export const analyzeBundleSize = () => performanceTester.testBundleSize();

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const startTest = (testName: string) => performanceTester.start(testName);
  const endTest = (testName: string, success: boolean, details?: any) => 
    performanceTester.end(testName, success, details);
  const getResults = () => performanceTester.getResults();
  const clearResults = () => performanceTester.clearResults();

  return {
    startTest,
    endTest,
    getResults,
    clearResults
  };
};
