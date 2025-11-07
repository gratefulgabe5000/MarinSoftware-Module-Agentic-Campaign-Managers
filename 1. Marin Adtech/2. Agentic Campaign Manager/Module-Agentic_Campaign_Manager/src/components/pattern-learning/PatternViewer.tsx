import React from 'react';
import { CampaignPatterns } from '../../types/campaign-patterns.types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { AlertTriangleIcon, SparklesIcon } from 'lucide-react';

/**
 * Pattern Viewer Component Props
 */
interface PatternViewerProps {
  patterns: CampaignPatterns;
  isMockData?: boolean;
  onContinue?: () => void;
}

/**
 * Pattern Viewer Component
 * Displays extracted campaign patterns
 */
const PatternViewer: React.FC<PatternViewerProps> = ({
  patterns,
  isMockData = false,
  onContinue,
}) => {
  return (
    <div className="space-y-6">
      {isMockData && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertTriangleIcon className="h-4 w-4 text-warning" />
            <p className="text-sm font-medium">Using mock data for demonstration</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {/* Ad Group Structures */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Group Structures</CardTitle>
            <CardDescription>Patterns from your campaign organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Naming Convention</label>
                <p className="text-sm text-muted-foreground">
                  {patterns.adGroupStructures.namingConvention}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Avg Keywords per Group</label>
                <p className="text-2xl font-bold">
                  {patterns.adGroupStructures.averageKeywordsPerGroup}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Common Themes</label>
              <div className="flex flex-wrap gap-2">
                {patterns.adGroupStructures.themes.map((theme, index) => (
                  <Badge key={index} variant="secondary">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Performing Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>High Performing Keywords</CardTitle>
            <CardDescription>Top 20 keywords based on performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {patterns.highPerformingKeywords.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Match Type</TableHead>
                      <TableHead className="text-right">CTR</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      {patterns.highPerformingKeywords[0]?.roas && (
                        <TableHead className="text-right">ROAS</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patterns.highPerformingKeywords.slice(0, 20).map((kw, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{kw.keyword}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{kw.matchType}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{kw.ctr.toFixed(2)}%</TableCell>
                        <TableCell className="text-right">{kw.conversions}</TableCell>
                        {kw.roas && (
                          <TableCell className="text-right font-medium">
                            {kw.roas.toFixed(2)}x
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No high-performing keywords found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ad Copy Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Copy Patterns</CardTitle>
            <CardDescription>Templates and messaging patterns from your ads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Headline Templates</label>
                <Badge variant="secondary">
                  {patterns.adCopyPatterns.headlineTemplates.length} templates
                </Badge>
              </div>
              <div className="space-y-2">
                {patterns.adCopyPatterns.headlineTemplates.slice(0, 5).map(
                  (template, index) => (
                    <div key={index} className="rounded-lg bg-muted p-3 text-sm">
                      {template}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Description Templates</label>
                <Badge variant="secondary">
                  {patterns.adCopyPatterns.descriptionTemplates.length} templates
                </Badge>
              </div>
              <div className="space-y-2">
                {patterns.adCopyPatterns.descriptionTemplates.slice(0, 3).map(
                  (template, index) => (
                    <div key={index} className="rounded-lg bg-muted p-3 text-sm">
                      {template}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Common CTAs</label>
              <div className="flex flex-wrap gap-2">
                {patterns.adCopyPatterns.commonCTAs.map((cta, index) => (
                  <Badge key={index} variant="outline">
                    {cta}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Avg Headlines per Ad</label>
                <p className="text-2xl font-bold">
                  {patterns.adCopyPatterns.averageHeadlinesPerAd}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Avg Descriptions per Ad</label>
                <p className="text-2xl font-bold">
                  {patterns.adCopyPatterns.averageDescriptionsPerAd}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bidding Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Bidding Patterns</CardTitle>
            <CardDescription>Typical bidding strategy and costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Avg CPC</label>
                <p className="text-2xl font-bold">
                  ${patterns.biddingPatterns.averageCPC.toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Bid Strategy</label>
                <div className="flex items-center h-8">
                  <Badge variant="default" className="text-sm">
                    {patterns.biddingPatterns.bidStrategy}
                  </Badge>
                </div>
              </div>
              {patterns.biddingPatterns.averageCPM && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Avg CPM</label>
                  <p className="text-2xl font-bold">
                    ${patterns.biddingPatterns.averageCPM.toFixed(2)}
                  </p>
                </div>
              )}
              {patterns.biddingPatterns.averageCPA && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Avg CPA</label>
                  <p className="text-2xl font-bold">
                    ${patterns.biddingPatterns.averageCPA.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {onContinue && (
        <Card>
          <CardContent className="flex justify-center p-6">
            <Button onClick={onContinue} type="button" size="lg">
              <SparklesIcon className="h-4 w-4" />
              Continue to Generation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatternViewer;

