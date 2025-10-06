import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

import LatestUpdates from '../components/dashboard/LatestUpdates';
import ProfileEditButton from '../components/dashboard/ProfileEditButton';
import Layout from '../components/layout';
import { statsService } from '../services/StatsService';
import useAuth from '../store/authStore';

export default function Dashboard() {
  const { data, isLoading } = useQuery('stats', statsService.getStats);
  const { authenticatedUser } = useAuth();
  const isAdmin = authenticatedUser?.role === 'admin';
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="relative">
        <h1 className="font-semibold text-3xl my-3">{t('dashboard')}</h1>
      </div>
      <hr />
      <div className="mt-5 flex flex-col gap-5">
        {!isLoading ? (
          <div className="flex flex-col sm:flex-row gap-5">
            {isAdmin ? (
              <div className="card shadow text-white bg-blue-500 flex-1">
                <h1 className="font-semibold sm:text-4xl text-center mb-3">
                  {data.numberOfUsers}
                </h1>
                <p className="text-center sm:text-lg font-semibold">
                  {t('users')}
                </p>
              </div>
            ) : null}
            <div className="card shadow text-white bg-indigo-500 flex-1">
              <h1 className="font-semibold sm:text-4xl mb-3 text-center">
                {data.numberOfCourses}
              </h1>
              <p className="text-center sm:text-lg font-semibold">
                {t('courses')}
              </p>
            </div>
            <div className="card shadow text-white bg-green-500 flex-1">
              <h1 className="font-semibold sm:text-4xl mb-3 text-center">
                {data.numberOfContents}
              </h1>
              <p className="text-center sm:text-lg font-semibold">
                {t('contents')}
              </p>
            </div>
          </div>
        ) : null}
        <ProfileEditButton />
        {/* <UpdateProfile /> */}
        <LatestUpdates />
      </div>
    </Layout>
  );
}
