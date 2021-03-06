import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Image, TouchableOpacity, Modal } from 'react-native';
import { Header, PrimaryButton, Alrighty } from '../Common';
import { Colors, Typography } from '_styles';
import {
  insertImageAtIndexCoordinate,
  polygonUpdate,
  getCoordByIndex,
  removeLastCoord,
  completePolygon,
} from '../../Actions';
import { store } from '../../Actions/store';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RNCamera } from 'react-native-camera';
// import { APLHABETS } from '../../Utils/index';
import {toLetters} from '../../Utils/mapMarkingCoordinate';
import i18next from 'i18next';

const infographicText = [
  {
    heading: i18next.t('label.info_graphic_header_1'),
    subHeading: i18next.t('label.info_graphic_sub_header_1'),
  },
  {
    heading: i18next.t('label.info_graphic_header_2'),
    subHeading: i18next.t('label.info_graphic_sub_header_2'),
  },
  {
    heading: i18next.t('label.info_graphic_header_3'),
    subHeading: i18next.t('label.info_graphic_sub_header_3'),
  },
];

const ImageCapturing = ({
  toggleState,
  isCompletePolygon,
  locationText,
  activeMarkerIndex,
  updateActiveMarkerIndex,
}) => {
  const camera = useRef();

  const navigation = useNavigation();
  const { state } = useContext(store);
  const [imagePath, setImagePath] = useState('');
  const [APLHABETS, setAPLHABETS] = useState([]);

  const [isAlrightyModalShow, setIsAlrightyModalShow] = useState(false);

  useEffect(() => {
    getCoordByIndex({ inventory_id: state.inventoryID, index: activeMarkerIndex }).then(
      ({ coordsLength, coord }) => {
        if (coord.imageUrl) {
          setImagePath(coord.imageUrl);
        }
      },
    );
    generateMarkers();
  }, []);

  const generateMarkers = () => {
    let array = [];
    for (var x = 1, y; x <= 130; x++) {
      y = toLetters(x);
      array.push(y);
    }
    setAPLHABETS(array);
  };

  const onPressCamera = async () => {
    if (imagePath) {
      setImagePath('');
      return;
    }
    const options = { quality: 0.5 };
    const data = await camera.current.takePictureAsync(options);
    setImagePath(data.uri);
  };

  const onPressClose = () => {
    setIsAlrightyModalShow(false);
  };

  const onPressContinue = () => {
    if (isAlrightyModalShow) {
      if (imagePath) {
        let data = {
          inventory_id: state.inventoryID,
          imageUrl: imagePath,
          index: activeMarkerIndex,
        };
        insertImageAtIndexCoordinate(data).then(() => {
          if (isCompletePolygon) {
            setIsAlrightyModalShow(false);
            navigation.navigate('InventoryOverview');
          } else {
            updateActiveMarkerIndex(activeMarkerIndex + 1);
            toggleState();
          }
        });
      } else {
        alert(i18next.t('label.image_capturing_required'));
      }
    } else {
      setIsAlrightyModalShow(true);
    }
  };

  const onBackPress = () => {
    removeLastCoord({ inventory_id: state.inventoryID }).then(() => {
      toggleState();
    });
  };

  const onPressCompletePolygon = () => {
    let data = { inventory_id: state.inventoryID, imageUrl: imagePath, index: activeMarkerIndex };
    insertImageAtIndexCoordinate(data).then(() => {
      polygonUpdate({ inventory_id: state.inventoryID }).then(() => {
        completePolygon({ inventory_id: state.inventoryID }).then(() => {
          setIsAlrightyModalShow(false);
          navigation.navigate('InventoryOverview');
        });
      });
    });
  };

  const renderAlrightyModal = () => {
    let infoIndex = activeMarkerIndex > 2 ? 2 : activeMarkerIndex;
    const { heading, subHeading } = infographicText[infoIndex];
    return (
      <Modal animationType={'slide'} visible={isAlrightyModalShow}>
        <View style={styles.mainContainer}>
          <Alrighty
            coordsLength={activeMarkerIndex + 1}
            onPressContinue={onPressContinue}
            onPressWhiteButton={onPressCompletePolygon}
            onPressClose={onPressClose}
            heading={heading}
            subHeading={subHeading}
          />
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} fourceInset={{ bottom: 'always' }}>
      <View style={styles.screenMargin}>
        <Header
          onBackPress={onBackPress}
          headingText={`Location ${APLHABETS[activeMarkerIndex]}`}
          subHeadingText={i18next.t('label.image_capturing_sub_header')}
        />
      </View>
      <View style={styles.container}>
        <View style={styles.container}>
          {imagePath ? (
            <Image source={{ uri: imagePath }} style={styles.container} />
          ) : (
            <View style={styles.cameraContainer}>
              <RNCamera
                ratio={'1:1'}
                captureAudio={false}
                ref={camera}
                style={styles.container}
                androidCameraPermissionOptions={{
                  title: i18next.t('label.permission_camera_title'),
                  message: i18next.t('label.permission_camera_message'),
                  buttonPositive: i18next.t('label.permission_camera_ok'),
                  buttonNegative: i18next.t('label.permission_camera_cancel'),
                }}></RNCamera>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={onPressCamera}
          style={styles.cameraIconContainer}
          accessibilityLabel="Camera"
          testID="camera_icon">
          <View style={styles.cameraIconCont}>
            <Ionicons name={imagePath ? 'md-reverse-camera' : 'md-camera'} size={25} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomBtnsContainer}>
        <PrimaryButton
          disabled={imagePath ? false : true}
          onPress={onPressContinue}
          btnText={i18next.t('label.continue')}
          style={styles.bottomBtnsWidth}
        />
      </View>
      {renderAlrightyModal()}
    </SafeAreaView>
  );
};
export default ImageCapturing;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  screenMargin: {
    marginHorizontal: 25,
  },
  cameraBelowTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  bottomBtnsContainer: {
    flexDirection: 'row',
    marginHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  addSpecies: {
    color: Colors.ALERT,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_18,
    lineHeight: Typography.LINE_HEIGHT_30,
  },
  message: {
    color: Colors.TEXT_COLOR,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    lineHeight: Typography.LINE_HEIGHT_30,
    textAlign: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  cameraIconCont: {
    width: 55,
    height: 55,
    borderColor: Colors.LIGHT_BORDER_COLOR,
    borderWidth: 1,
    backgroundColor: Colors.WHITE,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  bottomBtnsWidth: {
    width: '100%',
  },
});
