import { Button, Text, Icon, Icons } from 'react-basics';
import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import WebsiteChart from './WebsiteChart';
import useDashboard from 'store/dashboard';
import WebsiteHeader from './WebsiteHeader';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { useMessages, useLocale, useTeamUrl } from 'components/hooks';

export default function WebsiteChartList({
                                           websites,
                                           showCharts,
                                           limit,
                                         }) {
  const { formatMessage, labels } = useMessages();
  const { websiteOrder } = useDashboard();
  const { renderTeamUrl } = useTeamUrl();
  const { dir } = useLocale();

  const [visitorData, setVisitorData] = useState({});

  const handleVisitorsLoaded = useCallback((websiteId, visitors) => {
    setVisitorData(prevData => ({
      ...prevData,
      [websiteId]: visitors,
    }));
  }, []);

  const ordered = useMemo(() => {
    return websites
      .map(website => ({
        ...website,
        visitors: visitorData[website.id] || 0,
        order: websiteOrder.indexOf(website.id) || 0,
      }))
      .sort((a, b) => {
        if (a.visitors !== b.visitors) {
          return b.visitors - a.visitors; // Сортировка по убыванию числа посетителей
        }
        return a.order - b.order; // Если посетители равны, сортировка по order
      });
  }, [websites, visitorData, websiteOrder]);

  return (
    <div>
      {ordered.slice(0, limit).map(({ id }) => (
        <div key={id}>
          <WebsiteHeader websiteId={id} showLinks={false}>
            <Link href={renderTeamUrl(`/websites/${id}`)}>
              <Button variant="primary">
                <Text>{formatMessage(labels.viewDetails)}</Text>
                <Icon>
                  <Icons.ArrowRight rotate={dir === 'rtl' ? 180 : 0} />
                </Icon>
              </Button>
            </Link>
          </WebsiteHeader>
          <WebsiteMetricsBar
            websiteId={id}
            onVisitorsLoaded={handleVisitorsLoaded} // Передаем callback
          />
          {showCharts && <WebsiteChart websiteId={id} />}
        </div>
      ))}
    </div>
  );
}