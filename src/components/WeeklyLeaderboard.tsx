import getISOWeekYear from 'date-fns/getISOWeekYear';
import getISOWeek from 'date-fns/getISOWeek';
import { gql, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Query } from '../types';
import { LeaderboardTable } from './LeaderboardTable';
import { Progress } from 'react-bulma-components';
import { ErrorMessage } from './global/ErrorMessage';

const WEEKLY_LEADERBOARD = gql`
  query GetWeeklyLeaderboard($year: Int!, $week: ID!) {
    weeklyKillLeaderboard(year: $year, week: $week) {
      rank
      kills
      deaths
      character {
        id
        name
        career
        level
        renownRank
        guildMembership {
          guild {
            id
            name
          }
        }
      }
    }
  }
`;

export const WeeklyLeaderboard = (): JSX.Element => {
  const { t } = useTranslation(['common', 'components']);

  // To make sure we get the current week, even if local timezone differs.
  const now = new Date();
  var utcDate = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  const week = getISOWeek(utcDate);
  const year = getISOWeekYear(utcDate);

  const { loading, error, data } = useQuery<Query>(WEEKLY_LEADERBOARD, {
    variables: { year, week },
  });

  if (loading) return <Progress />;
  if (error) return <ErrorMessage name={error.name} message={error.message} />;
  if (data?.weeklyKillLeaderboard == null) return <p>{t('common:error')}</p>;

  return (
    <div>
      <div className="is-size-4 is-family-secondary is-uppercase">
        {t('components:leaderboard.weeklyTitle')}
      </div>
      <LeaderboardTable data={data.weeklyKillLeaderboard.slice(0, 10)} />
    </div>
  );
};
