import { useEffect, useState } from 'react';
import { Info, Cpu, MonitorPlay, Zap } from 'lucide-react';
import type { PlatformInfo } from '@/types';
import { api } from '@/services/ipc';
import { t } from '@/i18n';

export function AboutPage() {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);

  useEffect(() => {
    api.getPlatformInfo().then(setPlatformInfo).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-primary-600 flex items-center justify-center mb-4 shadow-lg">
          <MonitorPlay size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          {t('about.title')}
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          {t('app.tagline')}
        </p>
        <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">
          {t('about.version')} {t('app.version')}
        </p>
      </div>

      {/* Description */}
      <div className="card p-5">
        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
          {t('about.description')}
        </p>
      </div>

      {/* System Information */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-4">
          <Cpu size={16} />
          {t('about.systemInfo')}
        </h2>

        {platformInfo ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800">
              <span className="text-sm text-surface-500 dark:text-surface-400">
                {t('about.platform')}
              </span>
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {platformInfo.os}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800">
              <span className="text-sm text-surface-500 dark:text-surface-400">
                {t('about.architecture')}
              </span>
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {platformInfo.arch}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800">
              <span className="text-sm text-surface-500 dark:text-surface-400">
                {t('about.gpu')}
              </span>
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {platformInfo.hasGpu ? platformInfo.gpuName : 'Not detected'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800">
              <span className="text-sm text-surface-500 dark:text-surface-400">
                {t('about.captureApi')}
              </span>
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {platformInfo.captureApi}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-surface-500 dark:text-surface-400">
                {t('about.hwEncoding')}
              </span>
              <span>
                {platformInfo.supportsHwEncoding ? (
                  <span className="badge badge-success flex items-center gap-1">
                    <Zap size={10} />
                    {t('common.available')}
                  </span>
                ) : (
                  <span className="badge badge-warning">
                    {t('common.unavailable')}
                  </span>
                )}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-surface-400 dark:text-surface-500">
            {t('common.loading')}
          </p>
        )}
      </div>

      {/* Credits */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-3">
          <Info size={16} />
          {t('about.credits')}
        </h2>
        <p className="text-sm text-surface-600 dark:text-surface-400">
          {t('about.builtWith')}
        </p>
        <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">
          {t('about.license')}
        </p>
      </div>
    </div>
  );
}
