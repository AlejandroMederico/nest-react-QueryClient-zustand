import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

import { contentService } from '../../services/ContentService';
import { courseService } from '../../services/CourseService';

export default function LatestUpdates() {
  const { t } = useTranslation();
  const { data: courses, isLoading: loadingCourses } = useQuery(
    'latest-courses',
    async () => {
      const res = await courseService.findAll({
        page: 1,
        limit: 5,
        order: 'desc',
        sort: 'dateCreated',
      });
      return res.data;
    },
  );

  const { data: contents, isLoading: loadingContents } = useQuery(
    'latest-contents',
    async () => {
      const res = await contentService.findLatestGlobal(5);
      return res;
    },
  );

  return (
    <div className="flex flex-col md:flex-row gap-5 mt-8">
      <div className="card shadow flex-1">
        <h2 className="font-semibold text-lg mb-3">{t('latest_courses')}</h2>
        {loadingCourses ? (
          <div>{t('loading')}</div>
        ) : (
          <ul className="divide-y">
            {courses?.map((c) => (
              <li key={c.id} className="py-2">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">{c.description}</div>
                <div className="text-xs text-gray-400">
                  {new Date(c.dateCreated).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card shadow flex-1">
        <h2 className="font-semibold text-lg mb-3">{t('latest_contents')}</h2>
        {loadingContents ? (
          <div>{t('loading')}</div>
        ) : (
          <ul className="divide-y">
            {contents?.map((ct) => (
              <li key={ct.id} className="py-2">
                <div className="font-semibold">{ct.name}</div>
                <div className="text-sm text-gray-600">
                  {t('course')}: {ct.course?.name || '-'}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(ct.dateCreated).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
