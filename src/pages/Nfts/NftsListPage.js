import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { getSwitches } from '4m-wallet-adapter';

import { AppContext } from '../../AppProvider';
import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';
import { ROUTES_MAP as NFTS_ROUTES_MAP } from './routes';
import { isMoreThanOne } from '../../utils/nfts';

import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalNftList from '../../component-library/Global/GlobalNftList';
import GlobalText from '../../component-library/Global/GlobalText';
import Header from '../../component-library/Layout/Header';

import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP } from '../../utils/tracking';
import NftCollections from './components/NftCollections';

const NftsListPage = ({ t }) => {
  useAnalyticsEventTracker(SECTIONS_MAP.NFT_LIST);
  const navigate = useNavigation();
  const [{ activeBlockchainAccount, networkId }] = useContext(AppContext);
  const [loaded, setLoaded] = useState(false);
  const [listedInfo, setListedInfo] = useState([]);
  const [nftsGroup, setNftsGroup] = useState([]);
  const [switches, setSwitches] = useState(null);

  useEffect(() => {
    getSwitches().then(allSwitches =>
      setSwitches(allSwitches[networkId].sections.nfts),
    );
  }, [networkId]);

  useEffect(() => {
    const load = async () => {
      if (activeBlockchainAccount) {
        try {
          setLoaded(false);
          const nfts = await activeBlockchainAccount.getAllNftsGrouped();
          setNftsGroup(nfts);
          if (switches?.list_in_marketplace?.active) {
            const listed = await activeBlockchainAccount.getListedNfts();
            setListedInfo(listed);
          }
        } finally {
          setLoaded(true);
        }
      }
    };

    load();
  }, [activeBlockchainAccount, switches]);

  const onClick = nft => {
    if (isMoreThanOne(nft)) {
      navigate(NFTS_ROUTES_MAP.NFTS_COLLECTION, { id: nft.collection });
    } else {
      navigate(NFTS_ROUTES_MAP.NFTS_DETAIL, {
        id: nft.mint || nft.items[0].mint,
      });
    }
  };

  return (
    <GlobalLayout>
      <GlobalLayout.Header>
        <Header />
        <View>
          <GlobalText center type="headline2">
            {t(`wallet.nfts`)}
          </GlobalText>
        </View>
        {switches?.list_in_marketplace?.active && <NftCollections t />}
        <View>
          <GlobalText type="headline3">{t(`wallet.my_nfts`)}</GlobalText>
        </View>
        <GlobalNftList
          loading={!loaded}
          nonFungibleTokens={nftsGroup}
          listedInfo={listedInfo}
          onClick={onClick}
        />
      </GlobalLayout.Header>
    </GlobalLayout>
  );
};

export default withTranslation()(NftsListPage);
