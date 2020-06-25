
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Typography } from '_styles';
import { tree, placeholder_image } from '../../../assets'
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons'


const InventoryCard = ({ data, icon, activeBtn, onPressActiveBtn }) => {

    const onPressActiveButton = () => {
        if(onPressActiveBtn)
            onPressActiveBtn(data.index)
    }

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={activeBtn ? placeholder_image : tree} resizeMode={'stretch'} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.subHeadingText}>{data.title}</Text>
                <Text style={styles.subHeadingText}>{data.measurement}</Text>
                <View style={styles.actionBtnContainer}>
                    <Text style={[styles.subHeadingText, activeBtn && styles.activeText]} onPress={onPressActiveButton}>{data.date}</Text>
                    {icon && <MCIcons name={'cloud-outline'} size={22} style={styles.activeText} />}
                </View>
            </View>
        </View>
    )
}
export default InventoryCard;

const styles = StyleSheet.create({
    container :{
        height: 130, flexDirection: 'row', backgroundColor: Colors.WHITE, marginVertical: 10
    },
    imageContainer :{
        flex: 1, justifyContent: 'center', alignItems: 'center'
    },
    contentContainer:{
        flex: 1.2, justifyContent: 'space-evenly', marginHorizontal: 20
    },
    actionBtnContainer :{
        flexDirection: 'row', justifyContent: 'space-between'
    },
    subHeadingText: {
        fontFamily: Typography.FONT_FAMILY_REGULAR,
        fontSize: Typography.FONT_SIZE_16,
        lineHeight: Typography.LINE_HEIGHT_24,
        color: Colors.TEXT_COLOR,
        fontWeight: Typography.FONT_WEIGHT_REGULAR,
    },
    activeText: {
        color: Colors.PRIMARY,
    },
})




