import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Button } from 'react-native-paper';
import DreamForm from './DreamForm'; // Assurez-vous que le chemin est correct

export default function DreamList() {
    const [dreams, setDreams] = useState([]);
    const [selectedDream, setSelectedDream] = useState(null); // État pour le rêve sélectionné

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await AsyncStorage.getItem('dreamFormDataArray');
                const dreamFormDataArray = data ? JSON.parse(data) : [];
                setDreams(dreamFormDataArray);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        };

        fetchData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    const data = await AsyncStorage.getItem('dreamFormDataArray');
                    const dreamFormDataArray = data ? JSON.parse(data) : [];
                    setDreams(dreamFormDataArray);
                } catch (error) {
                    console.error('Erreur lors de la récupération des données:', error);
                }
            };

            fetchData();

            return () => {
                console.log('Cette route est maintenant désactivée.');
            };
        }, [])
    );

    const handleDeleteDream = async (index) => {
        try {
            const updatedDreams = dreams.filter((_, i) => i !== index);
            setDreams(updatedDreams);
            await AsyncStorage.setItem('dreamFormDataArray', JSON.stringify(updatedDreams));
        } catch (error) {
            console.error('Erreur lors de la suppression du rêve:', error);
        }
    };

    const handleEditDream = (dream, index) => {
        setSelectedDream({ ...dream, index }); // Stocker le rêve et son index
    };

    const handleFormSubmit = () => {
        setSelectedDream(null); // Réinitialiser après soumission
        // Récupérer à nouveau les rêves pour mettre à jour la liste
        fetchData();
    };

    return (
        <ScrollView>
            <Text style={styles.title}>Liste des Rêves :</Text>
            {dreams.map((dream, index) => (
                <View key={index} style={styles.dreamContainer}>
                    <Text style={styles.dreamText}>
                        {dream.dreamText} - {dream.isLucidDream ? 'Lucide' : 'Non Lucide'} - 
                        {new Date(dream.todayDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                    <Button onPress={() => handleEditDream(dream, index)} mode="outlined" style={styles.editButton}>
                        Modifier
                    </Button>
                    <Button onPress={() => handleDeleteDream(index)} mode="contained" color="red" style={styles.deleteButton}>
                        Supprimer
                    </Button>
                </View>
            ))}
            {selectedDream && <DreamForm selectedDream={selectedDream} onFormSubmit={handleFormSubmit} />}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    dreamContainer: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    dreamText: {
        fontSize: 16,
        marginBottom: 10,
    },
    editButton: {
        marginBottom: 5,
    },
    deleteButton: {
        marginBottom: 5,
    },
});
