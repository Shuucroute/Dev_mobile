import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function DreamForm({ selectedDream, onFormSubmit }) {
    const [dreamText, setDreamText] = useState('');
    const [isLucidDream, setIsLucidDream] = useState(false);
    const [hashtag1, setHashtag1] = useState('');
    const [hashtag2, setHashtag2] = useState('');
    const [hashtag3, setHashtag3] = useState('');

    useEffect(() => {
        if (selectedDream) {
            setDreamText(selectedDream.dreamText);
            setIsLucidDream(selectedDream.isLucidDream);
            setHashtag1(selectedDream.hashtags.hashtag1.label);
            setHashtag2(selectedDream.hashtags.hashtag2.label);
            setHashtag3(selectedDream.hashtags.hashtag3.label);
        }
    }, [selectedDream]);

    const handleDreamSubmission = async () => {
        try {
            const existingData = await AsyncStorage.getItem('dreamFormDataArray');
            const formDataArray = existingData ? JSON.parse(existingData) : [];

            // Trouver les IDs des hashtags
            const hashtag1Id = await findHashtagIdByLabel(hashtag1);
            const hashtag2Id = await findHashtagIdByLabel(hashtag2);
            const hashtag3Id = await findHashtagIdByLabel(hashtag3);

            if (selectedDream) {
                // Mettre à jour l'existant
                const updatedDreams = formDataArray.map((dream, index) =>
                    index === selectedDream.index ? {
                        dreamText,
                        isLucidDream,
                        todayDate: new Date(),
                        hashtags: {
                            hashtag1: { id: hashtag1Id, label: hashtag1 },
                            hashtag2: { id: hashtag2Id, label: hashtag2 },
                            hashtag3: { id: hashtag3Id, label: hashtag3 },
                        },
                    } : dream
                );
                await AsyncStorage.setItem('dreamFormDataArray', JSON.stringify(updatedDreams));
            } else {
                // Ajouter un nouveau rêve
                formDataArray.push({
                    dreamText,
                    isLucidDream,
                    todayDate: new Date(),
                    hashtags: {
                        hashtag1: { id: hashtag1Id, label: hashtag1 },
                        hashtag2: { id: hashtag2Id, label: hashtag2 },
                        hashtag3: { id: hashtag3Id, label: hashtag3 },
                    },
                });
                await AsyncStorage.setItem('dreamFormDataArray', JSON.stringify(formDataArray));
            }

            // Réinitialiser les champs du formulaire
            setDreamText('');
            setIsLucidDream(false);
            setHashtag1('');
            setHashtag2('');
            setHashtag3('');
            onFormSubmit();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données:', error);
        }
    };

    const findHashtagIdByLabel = async (hashtag) => {
        try {
            const existingDreams = await AsyncStorage.getItem('dreamFormDataArray');
            let dreamsData = existingDreams ? JSON.parse(existingDreams) : [];

            for (let dream of dreamsData) {
                for (let hashtagKey in dream.hashtags) {
                    const hashtagStored = dream.hashtags[hashtagKey];
                    if (hashtagStored.label === hashtag) {
                        return hashtagStored.id;
                    }
                }
            }
            const newId = `hashtag-${Math.random().toString(36).substr(2, 9)}`;
            return newId;
        } catch (error) {
            console.error('Erreur lors de la gestion des hashtags:', error);
            return null;
        }
    };

    const handleClearDreams = async () => {
        try {
            await AsyncStorage.removeItem('dreamFormDataArray');
            console.log('Toutes les entrées de rêves ont été supprimées.');
        } catch (error) {
            console.error('Erreur lors de la suppression des données:', error);
        }
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <TextInput
                    label="Rêve"
                    value={dreamText}
                    onChangeText={setDreamText}
                    mode="outlined"
                    multiline
                    numberOfLines={6}
                    style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
                />
                <View style={styles.checkboxContainer}>
                    <Checkbox.Item
                        label="Rêve Lucide"
                        status={isLucidDream ? 'checked' : 'unchecked'}
                        onPress={() => setIsLucidDream(!isLucidDream)}
                    />
                </View>
                <Button mode="contained" onPress={handleDreamSubmission} style={styles.button}>
                    Soumettre
                </Button>
                <Button mode="outlined" onPress={handleClearDreams} style={styles.button}>
                    Effacer tous les rêves
                </Button>
                <TextInput
                    label="Hashtag 1"
                    value={hashtag1}
                    onChangeText={setHashtag1}
                    mode="outlined"
                    style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
                />
                <TextInput
                    label="Hashtag 2"
                    value={hashtag2}
                    onChangeText={setHashtag2}
                    mode="outlined"
                    style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
                />
                <TextInput
                    label="Hashtag 3"
                    value={hashtag3}
                    onChangeText={setHashtag3}
                    mode="outlined"
                    style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    input: {
        marginBottom: 16,
    },
    checkboxContainer: {
        marginBottom: 16,
    },
    button: {
        marginBottom: 16,
    },
});
