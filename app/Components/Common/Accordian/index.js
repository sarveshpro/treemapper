import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Colors, Typography } from '_styles';
import Ionicons from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const Accordian = ({
  data,
  onChangeText,
  index,
  onPressDelete,
  onSubmitEditing,
  shouldExpand,
  status,
}) => {
  const treeCountInput = useRef();

  const [isOpen, setIsOpen] = useState(false);
  const [isNameOfTreesShow, setIsNameOfTreesShow] = useState(true);
  const [nameOfTree, setNameOfTree] = useState('');
  const [treeCount, setTreeCount] = useState('');

  useEffect(() => {
    if (shouldExpand) {
      setIsOpen(true);
    }
  }, []);
  const onPressAccordian = () => {
    setIsOpen(!isOpen);
    setIsNameOfTreesShow(true);
  };

  const label = data.nameOfTree ? data.nameOfTree : 'Species';

  const onSubmit = (action) => {
    if (action == 'treeCount') {
      setIsOpen(false);
      onChangeText(nameOfTree, 'nameOfTree', index);
      onChangeText(treeCount, 'treeCount', index);
      onSubmitEditing();
    } else {
      setIsNameOfTreesShow(false);
      setTimeout(() => treeCountInput.current.focus(), 100);
    }
  };

  const renderinputModal = () => {
    return (
      <Modal transparent={true} visible={isOpen}>
        <View style={styles.cont}>
          <View style={styles.cont}>
            <View style={styles.cont} />
            <KeyboardAvoidingView
              behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
              style={styles.bgWhite}>
              <View style={styles.externalInputContainer}>
                <Text style={styles.labelModal}>
                  {isNameOfTreesShow ? 'Name of trees' : 'Tree Count'}
                </Text>
                {isNameOfTreesShow ? (
                  <TextInput
                    value={nameOfTree}
                    onChangeText={(txt) => setNameOfTree(txt)}
                    style={styles.value}
                    autoFocus
                    placeholderTextColor={Colors.TEXT_COLOR}
                    onSubmitEditing={() => onSubmit('nameOfTrees')}
                  />
                ) : (
                  <TextInput
                    value={treeCount}
                    onChangeText={(txt) => setTreeCount(txt)}
                    ref={treeCountInput}
                    style={styles.value}
                    autoFocus
                    placeholderTextColor={Colors.TEXT_COLOR}
                    onSubmitEditing={() => onSubmit('treeCount')}
                    keyboardType={'numeric'}
                  />
                )}
                <MCIcon
                  onPress={() => onSubmit(isNameOfTreesShow ? 'nameOfTrees' : 'treeCount')}
                  name={'arrow-right'}
                  size={30}
                  color={Colors.PRIMARY}
                />
              </View>
              <SafeAreaView />
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={{ marginVertical: 10 }}>
      {renderinputModal()}
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <Text numberOfLines={1} style={styles.label}>
            {label}
          </Text>
          {!isOpen && (
            <View style={{ flexDirection: 'row', paddingHorizontal: 5 }}>
              <Text style={styles.treeCount}>{data.treeCount}</Text>
              <Text style={styles.trees}>Trees</Text>
            </View>
          )}
        </View>
        {status !== 'pending' && (
          <View style={styles.treeCountCont}>
            {!isOpen ? (
              <View style={{ flexDirection: 'row' }}>
                <Text onPress={() => onPressDelete(index)} style={styles.simpleText}>
                  Delete
                </Text>
                <Text onPress={onPressAccordian} style={[styles.simpleText, styles.primary]}>
                  Edit
                </Text>
              </View>
            ) : (
              <Ionicons
                onPress={onPressAccordian}
                name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={30}
                style={styles.arrowIcon}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};
export default Accordian;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    paddingVertical: 5,
    justifyContent: 'space-between',
  },
  cont: {
    flex: 1,
  },
  bgWhite: {
    backgroundColor: Colors.WHITE,
  },
  treeCountCont: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_22,
    lineHeight: Typography.LINE_HEIGHT_40,
    color: Colors.TEXT_COLOR,
    flex: 1,
  },
  treeCount: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_22,
    lineHeight: Typography.LINE_HEIGHT_40,
    color: Colors.PRIMARY,
  },
  trees: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_20,
    lineHeight: Typography.LINE_HEIGHT_40,
    color: Colors.TEXT_COLOR,
    marginHorizontal: 5,
  },
  arrowIcon: {
    color: Colors.TEXT_COLOR,
    marginTop: 5,
  },
  simpleText: {
    color: Colors.ALERT,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_16,
    lineHeight: Typography.LINE_HEIGHT_30,
    paddingHorizontal: 5,
  },
  primary: {
    color: Colors.PRIMARY,
  },
  externalInputContainer: {
    flexDirection: 'row',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 25,
    borderTopWidth: 0.5,
    borderColor: Colors.TEXT_COLOR,
  },
  value: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_20,
    color: Colors.TEXT_COLOR,
    fontWeight: Typography.FONT_WEIGHT_MEDIUM,
    flex: 1,
    paddingVertical: 10,
  },
  labelModal: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_18,
    lineHeight: Typography.LINE_HEIGHT_30,
    color: Colors.TEXT_COLOR,
    marginRight: 10,
  },
});
