import React, { useState, useMemo } from 'react';
import { CampaignPreviewData, AdGroupPreviewRow } from '../../types/campaign-preview.types';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import AdGroupRow from './AdGroupRow';
import ExportButton from './ExportButton';
import ExportInstructions from './ExportInstructions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ArrowUpIcon, ArrowDownIcon, FolderIcon, KeyIcon, FileTextIcon } from 'lucide-react';

/**
 * Campaign Preview Table Component
 * Main table component for displaying and editing campaigns
 */
interface CampaignPreviewTableProps {
  previewData: CampaignPreviewData;
}

const CampaignPreviewTable: React.FC<CampaignPreviewTableProps> = ({ previewData }) => {
  const [expandedAdGroups, setExpandedAdGroups] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'keywords' | 'ads'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { editedPreviewData } = useCampaignPreviewStore();

  // Use edited data if available, otherwise use original
  const displayData = editedPreviewData || previewData;

  const toggleAdGroup = (adGroupId: string) => {
    const newExpanded = new Set(expandedAdGroups);
    if (newExpanded.has(adGroupId)) {
      newExpanded.delete(adGroupId);
    } else {
      newExpanded.add(adGroupId);
    }
    setExpandedAdGroups(newExpanded);
  };

  // Filter and sort ad groups
  const filteredAndSortedAdGroups = useMemo(() => {
    let filtered = displayData.adGroups;

    // Filter by text
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      filtered = filtered.filter((ag) =>
        ag.name.toLowerCase().includes(lowerFilter) ||
        ag.keywords.some((kw) => kw.text.toLowerCase().includes(lowerFilter))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'keywords':
          comparison = a.keywords.length - b.keywords.length;
          break;
        case 'ads':
          comparison = a.ads.length - b.ads.length;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [displayData.adGroups, filterText, sortBy, sortOrder]);

  return (
    <div className="space-y-8">
      {/* Campaign Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{displayData.campaignName}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
              <FolderIcon className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-2xl font-bold">{displayData.adGroups.length}</p>
                <p className="text-sm text-muted-foreground">Ad Groups</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
              <KeyIcon className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-2xl font-bold">{displayData.totalKeywords}</p>
                <p className="text-sm text-muted-foreground">Keywords</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
              <FileTextIcon className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-2xl font-bold">{displayData.totalAds}</p>
                <p className="text-sm text-muted-foreground">Ads</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-text">Filter</Label>
              <Input
                id="filter-text"
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search ad groups or keywords..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort by</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'keywords' | 'ads')}>
                <SelectTrigger id="sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="keywords">Keywords Count</SelectItem>
                  <SelectItem value="ads">Ads Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                type="button"
                className="w-full"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <ArrowUpIcon className="h-4 w-4" />
                    Ascending
                  </>
                ) : (
                  <>
                    <ArrowDownIcon className="h-4 w-4" />
                    Descending
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Groups Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Name / Text</TableHead>
                  <TableHead>Match Type</TableHead>
                  <TableHead className="text-center">Keywords</TableHead>
                  <TableHead className="text-center">Ads</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAdGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No ad groups found matching your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedAdGroups.map((adGroup) => (
                    <AdGroupRow
                      key={adGroup.id}
                      adGroup={adGroup}
                      isExpanded={expandedAdGroups.has(adGroup.id)}
                      onToggle={() => toggleAdGroup(adGroup.id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <ExportInstructions />
            <ExportButton previewData={displayData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignPreviewTable;

