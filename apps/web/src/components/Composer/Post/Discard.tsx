import type { FC } from 'react';

import { HEY_API_URL } from '@hey/data/constants';
import { Alert } from '@hey/ui';
import getAuthApiHeaders from '@lib/getAuthApiHeaders';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCollectModuleStore } from 'src/store/non-persisted/publication/useCollectModuleStore';
import { usePublicationStore } from 'src/store/non-persisted/publication/usePublicationStore';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import { useProStore } from 'src/store/non-persisted/useProStore';

interface DiscardProps {
  onDiscard: () => void;
}

const Discard: FC<DiscardProps> = ({ onDiscard }) => {
  const { isPro } = useProStore();
  const { setShowDiscardModal, showDiscardModal } = useGlobalModalStateStore();
  const { publicationContent } = usePublicationStore();
  const { collectModule } = useCollectModuleStore((state) => state);

  const canBeDrafted = publicationContent.length > 0;

  const updateDraft = async () => {
    if (!canBeDrafted || !isPro) {
      setShowDiscardModal(false);
      return;
    }

    try {
      const draft = {
        collectModule: collectModule.type
          ? JSON.stringify(collectModule)
          : null,
        content: publicationContent
      };

      await axios.post(`${HEY_API_URL}/drafts/update`, draft, {
        headers: getAuthApiHeaders()
      });
      onDiscard();
      setShowDiscardModal(false);
    } catch {
      return toast.error('Error saving draft');
    }
  };

  return (
    <Alert
      cancelText={canBeDrafted && isPro ? 'Save as draft' : 'Cancel'}
      confirmText="Discard"
      description="You can save this to send later from your drafts."
      isDestructive
      onClose={updateDraft}
      onConfirm={() => {
        onDiscard();
        setShowDiscardModal(false);
      }}
      show={showDiscardModal}
      title="Discard Post"
    />
  );
};

export default Discard;
