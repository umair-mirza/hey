import type { FollowRevenueRequest } from '@hey/lens';

import Loader from '@components/Shared/Loader';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { STATIC_IMAGES_URL } from '@hey/data/constants';
import { useFollowRevenuesQuery } from '@hey/lens';
import humanize from '@hey/lib/humanize';
import { Card, CardHeader, ErrorMessage } from '@hey/ui';
import { type FC } from 'react';
import { useAllowedTokensStore } from 'src/store/persisted/useAllowedTokens';

interface SuperFollowRevenueProps {
  profileId: string;
}

const SuperFollowRevenue: FC<SuperFollowRevenueProps> = ({ profileId }) => {
  const { allowedTokens } = useAllowedTokensStore();
  const request: FollowRevenueRequest = { for: profileId };

  const { data, error, loading } = useFollowRevenuesQuery({
    skip: !profileId,
    variables: { request }
  });

  if (loading) {
    return (
      <Card>
        <Loader className="my-10" message="Loading Super follow revenue..." />
      </Card>
    );
  }

  if (data?.followRevenues.revenues.length === 0) {
    return null;
  }

  if (error) {
    return (
      <ErrorMessage error={error} title="Failed to load super follow revenue" />
    );
  }

  const tokensAvailable = allowedTokens?.map((token) => token.symbol);

  return (
    <Card>
      <CardHeader title="Super follow revenue" />
      <div className="p-5">
        {data?.followRevenues.revenues.map((revenue, index) => (
          <div className="flex items-center space-x-2" key={index}>
            {tokensAvailable?.includes(revenue.total.asset.symbol) ? (
              <img
                alt={revenue.total.asset.symbol}
                className="size-5"
                src={`${STATIC_IMAGES_URL}/tokens/${revenue.total.asset.symbol}.svg`}
              />
            ) : (
              <CurrencyDollarIcon className="size-5" />
            )}
            <div className="text-lg font-bold">{revenue.total.asset.name}</div>
            <div className="text-sm">
              {humanize(parseFloat(revenue.total.value))}{' '}
              {revenue.total.asset.symbol}
            </div>
            <div className="text-sm">(${revenue.total.asFiat?.value})</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SuperFollowRevenue;
