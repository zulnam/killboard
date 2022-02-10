import { gql, useQuery } from '@apollo/client';
import { Progress, Table, Button } from 'react-bulma-components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CareerIcon } from '../components/CareerIcon';
import { Query } from '../types';
import { ErrorMessage } from '../components/global/ErrorMessage';

const GUILD_MEMBERS = gql`
  query GetGuildMembers($id: ID!, $cursor: String) {
    guild(id: $id) {
      members(first: 25, after: $cursor) {
        nodes {
          rank {
            name
          }
          character {
            id
            name
            career
            level
            renownRank
          }
        }
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`;

export const GuildMemberList = ({
  id,
}: {
  id: string | undefined;
}): JSX.Element => {
  const { t } = useTranslation(['common', 'pages']);
  const { loading, error, data, fetchMore } = useQuery<Query>(GUILD_MEMBERS, {
    variables: { id },
  });

  if (loading) return <Progress />;
  if (error) return <ErrorMessage name={error.name} message={error.message} />;
  if (data?.guild?.members?.nodes == null)
    return <ErrorMessage customText={t('common:notFound')} />;

  const pageInfo = data.guild.members.pageInfo;

  return (
    <div>
      <Table striped hoverable size="fullwidth">
        <thead>
          <tr>
            <th></th>
            <th>{t('pages:guildMembers.name')}</th>
            <th>{t('pages:guildMembers.level')}</th>
            <th>{t('pages:guildMembers.renownRank')}</th>
            <th>{t('pages:guildMembers.guildRank')}</th>
          </tr>
        </thead>
        <tbody>
          {data.guild.members.nodes.map((member) => (
            <tr key={member.character.id}>
              <td>
                <CareerIcon career={member.character.career} />
              </td>
              <td>
                <Link to={`/character/${member.character.id}`}>
                  {member.character.name}
                </Link>
              </td>
              <td>{member.character.level}</td>
              <td>{member.character.renownRank}</td>
              <td>{member.rank.name}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {pageInfo && (
        <div className="field is-grouped is-pulled-right">
          {pageInfo.hasPreviousPage && (
            <Button
              color={'info'}
              size={'small'}
              onClick={() =>
                fetchMore({
                  variables: { cursor: pageInfo.startCursor },
                })
              }
            >
              {t('common:prevPage')}
              <i className="fas fa-circle-chevron-left ml-1" />
            </Button>
          )}
          {pageInfo.hasNextPage && (
            <Button
              color={'info'}
              size={'small'}
              onClick={() =>
                fetchMore({
                  variables: { cursor: pageInfo.endCursor },
                })
              }
            >
              {t('common:nextPage')}
              <i className="fas fa-circle-chevron-right ml-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
