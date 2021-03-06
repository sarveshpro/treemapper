import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Header, LargeButton, PrimaryButton } from '../Common';
import { SafeAreaView } from 'react-native';
import { initiateInventory } from '../../Actions';
import { store } from '../../Actions/store';
import { Colors } from '_styles';
import { LocalInventoryActions } from '../../Actions/Action';
import i18next from 'i18next';

const RegisterTree = ({ navigation }) => {
  const globalState = useContext(store);
  const { dispatch } = globalState;

  const [treeType, setTreeType] = useState('multiple');

  const onPressSingleTree = () => setTreeType('single');
  const onPressMultipleTree = () => setTreeType('multiple');

  const onPressContinue = () => {
    let data = { treeType };
    initiateInventory(data).then((inventoryID) => {
      dispatch(LocalInventoryActions.setInventoryId(inventoryID));
      if (treeType === 'multiple') {
        navigation.navigate('LocateTree');
      } else {
        navigation.navigate('RegisterSingleTree');
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Header
            headingText={i18next.t('label.register_trees')}
            subHeadingText={i18next.t('label.register_trees_description')}
          />
          <LargeButton
            onPress={onPressSingleTree}
            heading={i18next.t('label.tree_registration_type_1')}
            subHeading={i18next.t('label.tree_registration_type_1_sub_header')}
            active={treeType == 'single'}
            subHeadingStyle={treeType == 'single' && styles.activeTextColor}
            testID={'page_rt_single_tree'}
            accessibilityLabel={'Single Tree'}
          />
          <LargeButton
            onPress={onPressMultipleTree}
            heading={i18next.t('label.tree_registration_type_2')}
            subHeading={i18next.t('label.tree_registration_type_1_sub_header')}
            active={treeType == 'multiple'}
            subHeadingStyle={treeType == 'multiple' && styles.activeTextColor}
            testID={'page_rt_multiple_trees'}
            accessibilityLabel={'Mutiple Trees'}
          />
          <View style={{ flex: 1 }}></View>
        </ScrollView>
        <PrimaryButton
          onPress={onPressContinue}
          btnText={i18next.t('label.continue')}
          theme={'primary'}
          testID={'btn_rt_continue'}
          accessibilityLabel={'Continue'}
        />
      </View>
    </SafeAreaView>
  );
};
export default RegisterTree;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    backgroundColor: Colors.WHITE,
  },
  activeTextColor: {
    color: Colors.PRIMARY,
  },
});
