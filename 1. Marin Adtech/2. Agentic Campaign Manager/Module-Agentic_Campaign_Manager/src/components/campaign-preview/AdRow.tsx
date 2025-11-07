import React, { useState } from 'react';
import { GeneratedRSA } from '../../types/rsa-generation.types';
import AdCopyEditor from './AdCopyEditor';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TableCell, TableRow } from '../ui/table';
import { ChevronRightIcon, ChevronDownIcon, FileTextIcon } from 'lucide-react';

/**
 * Ad Row Component
 * Editable row for a Responsive Search Ad
 */
interface AdRowProps {
  ad: GeneratedRSA;
  adGroupId: string;
}

const AdRow: React.FC<AdRowProps> = ({ ad, adGroupId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="w-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="gap-1">
            <FileTextIcon className="h-3 w-3" />
            Ad
          </Badge>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            RSA Ad ({ad.headlines.length} headlines, {ad.descriptions.length} descriptions)
          </span>
        </TableCell>
        <TableCell className="text-center text-muted-foreground">—</TableCell>
        <TableCell className="text-center text-muted-foreground">—</TableCell>
        <TableCell className="text-center">
          <span className="text-xs text-muted-foreground font-mono">
            {ad.headlines.length}H / {ad.descriptions.length}D
          </span>
        </TableCell>
        <TableCell className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/30 p-4">
            <AdCopyEditor ad={ad} adGroupId={adGroupId} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default AdRow;

