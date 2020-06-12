import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Modal, Image, FlatList, ActivityIndicator } from 'react-native';
import { Header, LargeButton, PrimaryButton, Input, Accordian, Alrighty, InventoryCard } from '../Common';
import { SafeAreaView } from 'react-native'
import { Colors, Typography } from '_styles';
import { placeholder_image } from '../../assets';
import MapboxGL from '@react-native-mapbox-gl/maps';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons'



const SavedAreas = ({ }) => {
    const [areas, setAreas] = useState(null)

    useEffect(() => {
        loadAreas()
    }, [])

    const loadAreas = async () => {
        const offlinePack = await MapboxGL.offlineManager.getPacks();
        let normalAreas = []
        for (let oneArea in offlinePack) {
            normalAreas.push(offlinePack[oneArea])
        }
        setAreas(normalAreas)
    }

    const renderSavedAreaItem = () => {
        return (
            <View style={{ height: 130, flexDirection: 'row', backgroundColor: Colors.WHITE }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={placeholder_image} resizeMode={'stretch'} />
                </View>
                <View style={{ flex: 1.2, justifyContent: 'space-evenly', marginHorizontal: 20 }}>
                    <Text style={styles.subHeadingText}>{'Chicago, USA'}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[styles.subHeadingText, styles.regularText]}>{'120 MB'}</Text>
                        <Text style={[styles.subHeadingText, styles.redText]}>{'Delete'}</Text>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                <Header headingText={'Saved Areas'} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    {areas && areas.length > 0 ? < FlatList
                        data={areas}
                        renderItem={renderSavedAreaItem}
                    /> : <ActivityIndicator />}
                </ScrollView>
                <PrimaryButton btnText={'Add Area'} />
            </View>
        </SafeAreaView>
    )
}
export default SavedAreas;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 25,
        backgroundColor: Colors.WHITE
    },
    subHeadingText: {
        fontFamily: Typography.FONT_FAMILY_SEMI_BOLD,
        fontSize: Typography.FONT_SIZE_16,
        lineHeight: Typography.LINE_HEIGHT_24,
        color: Colors.TEXT_COLOR,
        fontWeight: Typography.FONT_WEIGHT_REGULAR,
    },
    redText: {
        color: 'red'
    },
    regularText: {
        fontFamily: Typography.FONT_FAMILY_REGULAR,

    },
    addSpecies: {
        color: Colors.ALERT,
        fontFamily: Typography.FONT_FAMILY_REGULAR,
        fontSize: Typography.FONT_SIZE_18,
        lineHeight: Typography.LINE_HEIGHT_30,
        textAlign: 'center'
    }
})