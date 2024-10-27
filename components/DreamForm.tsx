import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { TextInput, Button, Checkbox, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function DreamForm({ selectedDream, onFormSubmit }) {
    const [dreamText, setDreamText] = useState('');
    const [isLucidDream, setIsLucidDream] = useState(false);
    const [hashtags, setHashtags] = useState([]);
    const [newHashtag, setNewHashtag] = useState('');
    const isEditing = !!selectedDream;

    useEffect(() => {
        if (selectedDream) {
            setDreamText(selectedDream.dreamText);
            setIsLucidDream(selectedDream.isLucidDream);
            setHashtags(selectedDream.hashtags || []);
        }
    }, [selectedDream]);

    const handleDreamSubmission = async () => {
        try {
            const existingData = await AsyncStorage.getItem('dreamFormDataArray');
            const formDataArray = existingData ? JSON.parse(existingData) : [];

            const newDream = {
                dreamText,
                isLucidDream,
                hashtags,
                todayDate: new Date().toISOString(), // Date et heure actuelles
            };

            // Ajouter ou modifier le rêve dans le tableau
            if (isEditing) {
                const index = selectedDream.index;
                formDataArray[index] = newDream;
            } else {
                formDataArray.push(newDream);
            }

            await AsyncStorage.setItem('dreamFormDataArray', JSON.stringify(formDataArray));

            resetForm();
            onFormSubmit();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données:', error);
        }
    };

    const resetForm = () => {
        setDreamText('');
        setIsLucidDream(false);
        setHashtags([]);
        setNewHashtag('');
    };

    const addHashtag = () => {
        if (newHashtag.trim() !== '' && !hashtags.includes(newHashtag.trim())) {
            setHashtags([...hashtags, newHashtag.trim()]);
            setNewHashtag('');
        }
    };

    const removeHashtag = (hashtagToRemove) => {
        setHashtags(hashtags.filter((hashtag) => hashtag !== hashtagToRemove));
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
                    {isEditing ? 'Modifier' : 'Soumettre'}
                </Button>
                <TextInput
                    label="Ajouter un Hashtag"
                    value={newHashtag}
                    onChangeText={setNewHashtag}
                    mode="outlined"
                    style={[styles.input, { width: width * 0.8, alignSelf: 'center' }]}
                    onSubmitEditing={addHashtag}
                />
                <View style={styles.hashtagsContainer}>
                    {hashtags.map((hashtag, index) => (
                        <Chip key={index} onClose={() => removeHashtag(hashtag)}>
                            {hashtag}
                        </Chip>
                    ))}
                </View>
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
    hashtagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 8,
    },
});
