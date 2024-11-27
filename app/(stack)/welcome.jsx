import { View, Text, TouchableOpacity, StyleSheet, Modal, BackHandler, ToastAndroid, StatusBar } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Svg, Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const Welcome = () => {
  const [confirmExitVisible, setConfirmExitVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [exitApp, setExitApp] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useEffect(() => {
    const backAction = () => {
      if (exitApp) {
        BackHandler.exitApp();
      } else {
        ToastAndroid.show('Çıxmaq üçün yenidən basın', ToastAndroid.SHORT);
        setExitApp(true);
        setTimeout(() => setExitApp(false), 2000);
        return true;
      }
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [exitApp]);

  const handleConfirmExit = () => {
    BackHandler.exitApp();
  };

  const handleCancelExit = () => {
    setConfirmExitVisible(false);
  };

  const loadScoreAndQuizCount = async () => {
    try {
      const storedScore = await AsyncStorage.getItem('score');
      const storedQuizCount = await AsyncStorage.getItem('quizCount');

      if (storedScore !== null) {
        setScore(parseInt(storedScore, 10));
      } else {
        await AsyncStorage.setItem('score', '0');
      }

      if (storedQuizCount !== null) {
        setQuizCount(parseInt(storedQuizCount, 10));
      } else {
        await AsyncStorage.setItem('quizCount', '0');
      }
    } catch (e) {
      console.error('Failed to load score and quiz count.', e);
    }
  };

  useEffect(() => {
    setStrokeDashoffset(circumference * (1 - score / 100_000_0));
  }, [score, circumference]);

  useFocusEffect(
    useCallback(() => {
      loadScoreAndQuizCount();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.scoreBoard}>
        <Text style={styles.title}>Ən yüksək nəticə</Text>
        <View style={styles.scoreContainer}>
          <Svg height="200" width="200">
            <Circle cx="100" cy="100" r={radius} stroke="rgba(0, 106, 255,0.4)" strokeWidth="10" fill="none" />
            <Circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#006aff"
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin="100, 100"
            />
          </Svg>
          <Text style={styles.scoreText}>{score}{"\n"}<Text style={styles.subText}>xal</Text></Text>
        </View>
        <Text style={styles.questionsCount}>Cavablandırılmış sualların sayı: {quizCount}</Text>
      </View>

      <View style={styles.aboutContainer}>
        <TouchableOpacity style={styles.aboutButton} onPress={() => setAboutVisible(true)}>
          <Text style={styles.aboutText}>Haqqımızda</Text>
          <Icon name="information-circle-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.newGameButton} onPress={() => { router.replace('/home') }}>
          <Text style={styles.newGameText}>Yeni Oyuna Başlayın</Text>
        </TouchableOpacity>
      </View>
      
      <Modal animationType="slide" transparent visible={confirmExitVisible} onRequestClose={handleCancelExit}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Çıxmaq istəyirsinizmi?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.continueButton]} onPress={handleCancelExit}>
                <Text style={styles.textStyle}>Xeyr</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.collectButton]} onPress={handleConfirmExit}>
                <Text style={styles.textStyle}>Bəli</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={aboutVisible} onRequestClose={() => setAboutVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { height: '52%' }]}>
            <Text style={styles.gameText}>
             MilyonçuAZ oyununa xoş gəlmisiniz! Bu oyunda biliyinizlə böyük xallar qazana bilərsiniz.
            </Text>
            <Text style={styles.gameText}>
              Qaydalar sadədir: 17 sualı cavablayın, hər sualda 4 cavab variantı var və yalnız biri doğrudur. Yardım üçün üç jokeriniz var: "Cavabı görmə", "50/50" və "Tamaşaçı rəyi".
            </Text>
            <Text style={styles.gameText}>
              Bütün suallara doğru cavab verərək milyonçu olmağa çalışın. Uğurlar!
            </Text>
            <Text style={styles.gameText}>
              Dizayner: Davud Vahidov
              Developer: Abdulla Abdullazadə
            </Text>
            <TouchableOpacity style={styles.aboutCloseButton} onPress={() => setAboutVisible(false)}>
              <Text style={styles.aboutCloseText}>Bağla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    backgroundColor: '#006AFF',
    paddingTop: StatusBar.currentHeight, 
  },
  scoreBoard: {
    width: "90%",
    height: "40%",
    borderRadius: 30,
    backgroundColor: 'white',
    marginTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
    paddingTop: 20,
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
    position: 'absolute',
    textAlign: 'center',
  },
  subText: {
    textAlign: 'center',
  },
  questionsCount: {
    textAlign: 'center',
    fontWeight: 'bold',
    opacity: 0.6,
  },
  aboutContainer: {
    marginTop: 20,
    width: "90%",
    alignItems: 'flex-end',
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 16,
    color: 'white',
    marginRight: 5,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  newGameButton: {
    padding: 15,
    backgroundColor: 'white',
    opacity: 0.9,
    width: '90%',
    borderRadius: 10,
  },
  newGameText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  textStyle: {
    fontSize: 18,
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#32CD32',
    marginRight: 10,
  },
  collectButton: {
    backgroundColor: '#FF6347',
  },
  gameText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight:'bold'
  },
  aboutCloseButton: {
    backgroundColor: '#006AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  aboutCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Welcome;
