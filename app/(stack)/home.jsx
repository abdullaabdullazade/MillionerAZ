import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, BackHandler, SafeAreaView, StatusBar } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { questionsData_ } from './questions';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const questionsData = questionsData_;
const height = Dimensions.get('window').height;
const scoreQuestions = { 0: 0, 1: 1000, 2: 3000, 3: 4000, 4: 7000, 5: 10000, 6: 20000, 7: 25000, 8: 50000, 9: 100000, 10: 150000, 11: 200000, 12: 350000, 13: 450000, 14: 450000, 15: 600000, 16: 750000, 17: 1000000 };
let buttonsDisabled = { 0: false, 1: false, 2: false, 3: false };
let colorSelected = { 0: false, 1: false, 2: false, 3: false };
let correctAns = null;
let randomPeople = true;
let randomArr = [];
const colorSelect = '#fff';//rgba(255, 255, 0,0.7)
let textColorSelect = 'black'
const correctAnswerColor = '#00EF0A';
const wrongAnswerColor = '#E80E00';

let jokers = [true,true,true]

const shuffleArray = (array, usedQuestions) => {
  let availableQuestions = array.filter(q => !usedQuestions.includes(q.question));
  if (availableQuestions.length === 0) {
    availableQuestions = [...array];
    usedQuestions.length = 0; // Reset used questions if all questions have been used
  }
  const questionObj = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  const correctAns = questionObj.answers[questionObj.correct];
  const shuffledAnswers = questionObj.answers
    .map((answer) => ({ answer, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ answer }) => answer);

  const shuffledQuestion = {
    ...questionObj,
    answers: shuffledAnswers,
  };

  return [shuffledQuestion, correctAns];
};

const QuizApp = () => {
  const [questions, setQuestions] = useState(shuffleArray(questionsData, []));
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(scoreQuestions[0]);
  const [correctAnswer, setCorrectAnswer] = useState(false);
  const timerRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmExitVisible, setConfirmExitVisible] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [audiencePollVisible, setAudiencePollVisible] = useState(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [correctAnswerUsed, setCorrectAnswerUsed] = useState(false);
  const [audiencePollUsed, setAudiencePollUsed] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);
  const [disabledButton, setDisabledButtons] = useState(false);
  const [color, setColor] = useState(colorSelect);
  const [quiznum, setQuizNum] = useState(0);
  const [gameOverModel, setGameOverModel] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      setConfirmExitVisible(true);
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  const stopMusic = async () => {
    if (backgroundMusic) {
      await backgroundMusic.stopAsync();
    }
  };

  useEffect(() => {
    if (!gameOver && !correctAnswer) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [questions, gameOver, correctAnswer]);

  useEffect(() => {
    const loadSounds = async () => {
      const { sound: bgSound } = await Audio.Sound.createAsync(
        require('../../assets/background-music.mp3'),
        { isLooping: true }
      );
      setBackgroundMusic(bgSound);

      const { sound: correct } = await Audio.Sound.createAsync(
        require('../../assets/correct-answer.mp3')
      );
      setCorrectSound(correct);

      const { sound: wrong } = await Audio.Sound.createAsync(
        require('../../assets/wrong-answer.mp3')
      );
      setWrongSound(wrong);
    };

    loadSounds();

    return () => {
      if (backgroundMusic) {
        backgroundMusic.unloadAsync();
      }
      if (correctSound) {
        correctSound.unloadAsync();
      }
      if (wrongSound) {
        wrongSound.unloadAsync();
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (backgroundMusic) {
        backgroundMusic.playAsync();
      }

      return () => {
        // Stop background music when the screen is unfocused
        if (backgroundMusic) {
          backgroundMusic.stopAsync();
        }
      };
    }, [backgroundMusic])
  );

  useEffect(() => {
    const handleGameOver = async () => {
      if (gameOver || score == scoreQuestions[17]) {
        await stopMusic();  // Ensuring music stops when the game is over
        try {
          const storedScore = await AsyncStorage.getItem('score');
          const storedQuizCount = await AsyncStorage.getItem('quizCount');

          if (storedScore !== null) {
            const storedScoreInt = parseInt(storedScore, 10);
            if (score > storedScoreInt) {
              await AsyncStorage.setItem('score', score.toString());
            }
          } else {
            await AsyncStorage.setItem('score', score.toString());
          }

          if (storedQuizCount !== null) {
            const storedQuizCountInt = parseInt(storedQuizCount, 10);
            await AsyncStorage.setItem('quizCount', (storedQuizCountInt + quiznum).toString());
          } else {
            await AsyncStorage.setItem('quizCount', quiznum.toString());
          }
        } catch (e) {
        }
        FinalGame(score, quiznum);

      }
      return true;

    };

    handleGameOver();
  }, [gameOver, score]);

  useEffect(() => {
    if (score === scoreQuestions[17]) {
      router.replace('/finalgame');
    }
  }, [score, router]);

  useEffect(() => {
    return () => {
      setQuestions(shuffleArray(questionsData, usedQuestions));
      setTimeLeft(60);
      setGameOver(false);
      setScore(0);
      setCorrectAnswer(false);
      setModalVisible(false);
      setConfirmExitVisible(false);
      setShowCorrectAnswer(false);
      setAudiencePollVisible(false);
      setFiftyFiftyUsed(false);
      setCorrectAnswerUsed(false);
      setAudiencePollUsed(false);
      setDisabledButtons(false);
      setColor(colorSelect);
      setQuizNum(0);

      buttonsDisabled = { 0: false, 1: false, 2: false, 3: false };
      colorSelected = { 0: false, 1: false, 2: false, 3: false };
      correctAns = null
      jokers = [true,true,true]
      if (backgroundMusic) {
        backgroundMusic.unloadAsync();
      }
      if (correctSound) {
        correctSound.unloadAsync();
      }
      if (wrongSound) {
        wrongSound.unloadAsync();
      }
    }
  }, []);

  const handleAnswer = async (index) => {
    setDisabledButtons(true);
    clearTimeout();
    setTimeout(async () => {
      if (questions[0].answers[index] === questions[1]) {
        try{
        
          await correctSound.replayAsync();

        }
        catch{

        }
        setCorrectAnswer(true);
        const l = quiznum + 1;
        setQuizNum(l);
        setScore(scoreQuestions[l]);
        setModalVisible(true);
        setColor(correctAnswerColor);
        setUsedQuestions((prevUsedQuestions) => [...prevUsedQuestions, questions[0].question]);
        
      } else {
        try{
          await wrongSound.replayAsync();
        }
        catch{

        }
        setColor(wrongAnswerColor);
        correctAns = questions[0].answers.indexOf(questions[1]);

        setTimeout(() => {
          setGameOver(true);
        }, 2000);
      }
    }, 2000);
    textColorSelect='black'

  };

  const handleNextQuestion = () => {
    setQuestions(shuffleArray(questionsData, usedQuestions));
    setTimeLeft(60);
    setCorrectAnswer(false);
    setModalVisible(false);
    setDisabledButtons(false);
    buttonsDisabled = { 0: false, 1: false, 2: false, 3: false };
    colorSelected = { 0: false, 1: false, 2: false, 3: false };
    setColor(colorSelect);

    async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/background-music.mp3'),
      );
      setBackgroundMusic(sound);
    };
  };

  const handleCollectAndEnd = () => {
    setGameOver(true);
    setModalVisible(false);
  };

  const handleConfirm = () => {
    setConfirmExitVisible(false);
  };

  const handleCancelConfirm = () => {
    setGameOver(true);
    setConfirmExitVisible(false);
  };

  const handleFiftyFifty = () => {
    function getRandomElement(arr) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      return arr[randomIndex];
    }
    if (fiftyFiftyUsed) return;
    let a = [0, 1, 2, 3];
    const index = a.indexOf(questions[0].answers.indexOf(questions[1]));
    if (index > -1) {
      a.splice(index, 1);
    }
    const disabledbutton1 = getRandomElement(a);
    let disabledbutton2 = getRandomElement(a);
    while (disabledbutton1 === disabledbutton2) {
      disabledbutton2 = getRandomElement(a);
    }
    buttonsDisabled[disabledbutton1] = true;
    buttonsDisabled[disabledbutton2] = true;
    setFiftyFiftyUsed(true);
    jokers[0]=false
  };

  const handleShowCorrectAnswer = () => {
    if (correctAnswerUsed) return;
    setShowCorrectAnswer(true);
    setCorrectAnswerUsed(true);
    jokers[1]=false
  };

  const handleAudiencePoll = () => {
    if (audiencePollUsed) return;
    setAudiencePollVisible(true);
    setAudiencePollUsed(true);
    jokers[2]=false

  };
  const clickedButton = (index) => {
    colorSelected[index] = true;
  };


  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / 60);

  const FinalGame = (score, quiznum) => {
    router.replace({ pathname: '/finishgame', params: { 'score': score, 'count': quiznum } });
  };

  const generateRandomPercentages = () => {
    let remainingPercentage = 100;
    const percentages = [];
    for (let i = 0; i < 3; i++) {
      const randomPercentage = Math.floor(Math.random() * (remainingPercentage - (3 - i)) + 1);
      percentages.push(randomPercentage);
      remainingPercentage -= randomPercentage;
    }

    percentages.push(remainingPercentage);
    randomPeople = false;
    randomArr = percentages.sort(() => Math.random() - 0.5);
    return percentages.sort(() => Math.random() - 0.5);
  };

  const percentages = randomPeople ? generateRandomPercentages() : randomArr;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.exitContainer}>
        <TouchableOpacity onPress={() => setConfirmExitVisible(true)}>
          <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.timerContainer}>
        <Svg height="120" width="120">
          <Circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.4)" strokeWidth="10" fill="none" />
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#ffffff"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="60, 60"
          />
        </Svg>
        <Text style={styles.timerText}>{timeLeft}</Text>
      </View>

      <View style={styles.questionContainer}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Xal: {score}</Text>
        </View>
        <Text style={styles.question}>{questions[0].question}</Text>
      </View>
      <View style={styles.lifelinesContainer}>
        <TouchableOpacity style={[styles.lifelineButton,
        (jokers[0]==false) && {backgroundColor:'#d3d3d3'}
        ]} onPress={handleFiftyFifty} disabled={disabledButton}>
          <Icon name="percent" size={20} color="#fff" />
          <Text style={styles.lifelineText}>50/50</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.lifelineButton,
        (jokers[1]==false) && {backgroundColor:'#d3d3d3'}


        ]} onPress={handleShowCorrectAnswer} disabled={disabledButton}>
          <Icon name="eye" size={20} color="#fff" />
          <Text style={styles.lifelineText}>Düzgün Cavab</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.lifelineButton,
        (jokers[2]==false) && {backgroundColor:'#d3d3d3'}


        ]} onPress={handleAudiencePoll} disabled={disabledButton}>
          <Icon name="users" size={20} color="#fff" />
          <Text style={styles.lifelineText}>Xalqın Seçimi</Text>
        </TouchableOpacity>
      </View>
      {questions[0].answers.map((answer, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.answerButton,
            (buttonsDisabled[index]) && styles.disabledButton,
            (colorSelected[index]) && { backgroundColor: color },
            (correctAns == index) && { backgroundColor: correctAnswerColor }
          ]}
          onPress={() => {
            handleAnswer(index)
            clickedButton(index);
          }}

          disabled={disabledButton || buttonsDisabled[index]}
        >
          <Text style={[styles.answerText,
            (colorSelected[index])&&{
              color:textColorSelect,
            }]
          }>{answer}</Text>
        </TouchableOpacity>
      ))}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <View style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 15,
              backgroundColor: correctAnswerColor,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}>
              <Text style={{
                fontSize: 18,
                color: '#fff',
                fontWeight: 'bold'
              }}>Düz cavab!</Text>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: 20
            }}>
              <TouchableOpacity style={{
                backgroundColor: '#32CD32',
                borderRadius: 10,
                padding: 10,
                width: '45%',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'
              }} onPress={handleNextQuestion}>
                <Icon name="arrow-right" size={20} color="#fff" />
                <Text style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  marginLeft: 5
                }}>Davam Et</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                backgroundColor: '#FFD700',
                borderRadius: 10,
                padding: 10,
                width: '45%',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'
              }} onPress={handleCollectAndEnd}>
                <Icon name="money" size={20} color="#fff" />
                <Text style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  marginLeft: 5
                }}>Pulu Götür</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={confirmExitVisible} onRequestClose={() => setConfirmExitVisible(false)}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <Text style={{
              fontSize: 20,
              color: '#1E90FF',
              marginBottom: 20,
              fontWeight: 'bold'
            }}>Çıxmaq istəyirsiniz?</Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <TouchableOpacity style={{
                backgroundColor: '#32CD32',
                borderRadius: 10,
                padding: 10,
                width: '45%',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'
              }} onPress={handleConfirm}>
                <Icon name="arrow-right" size={20} color="#fff" />
                <Text style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  marginLeft: 5
                }}>Davam Et</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                backgroundColor: '#FFD700',
                borderRadius: 10,
                padding: 10,
                width: '45%',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'
              }} onPress={handleCancelConfirm}>
                <Icon name="money" size={20} color="#fff" />
                <Text style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  marginLeft: 5
                }}>Pulu Götür</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={showCorrectAnswer} onRequestClose={() => setShowCorrectAnswer(false)}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <Text style={{
              fontSize: 18,
              color: '#1E90FF',
              marginBottom: 20,
              alignItems: 'center',
              fontWeight: 'bold'
            }}>Düzgün Cavab: {questions[1]}</Text>
            <TouchableOpacity style={{
              backgroundColor: '#32CD32',
              borderRadius: 10,
              padding: 10,
              width: '45%',
              alignItems: 'center',
              justifyContent: 'center'
            }} onPress={() => setShowCorrectAnswer(false)}>
              <Text style={{
                color: '#fff',
                fontWeight: 'bold'
              }}>Bağla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={audiencePollVisible} onRequestClose={() => setAudiencePollVisible(false)}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <View style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 15,
              backgroundColor: '#ff4444',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}>
              <Text style={{
                fontSize: 18,
                color: '#fff',
                fontWeight: 'bold'
              }}>Xalqın Seçimi</Text>
            </View>
            {questions[0].answers.map((answer, index) => (
              <Text key={index} style={{
                fontSize: 16,
                color: '#1E90FF',
                marginVertical: 5,
                fontWeight: 'bold'

              }}>
                {String.fromCharCode(65 + index)}: {percentages[index]}%
              </Text>
            ))}
            <TouchableOpacity style={{
              backgroundColor: '#32CD32',
              borderRadius: 10,
              padding: 10,
              width: '45%',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20
            }} onPress={() => setAudiencePollVisible(false)}>
              <Text style={{
                color: '#fff',
                fontWeight: 'bold'
              }}>Bağla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>




    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#006AFF',
  },
  exitContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scoreContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 5,
  },
  scoreCircle: {
    position: 'absolute',
    right: 0, // Align the circle to the right of the container
  },
  scoreText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%', // Ensure the text takes the full width of the container
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    position: 'absolute',
  },
  questionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    width: '90%',
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
    borderWidth:1,
    borderColor:'#fff'

  },
  question: {
    fontSize: 24,
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
  answerButton: {
    padding: 15,
    marginBottom: 10,
    width: '90%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff3',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  answerText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight:'bold'
  },
  lifelinesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 10,
    paddingBottom: 10,
  },
  lifelineButton: {
    flexDirection: 'row',
    backgroundColor: '#004dba',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  lifelineText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    padding: 10,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: '#32CD32',
  },
  collectButton: {
    backgroundColor: '#FFD700',
  },
  textStyle: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 5,
  },
  homeButton: {
    backgroundColor: '#FF6347',
  },
  restartButton: {
    backgroundColor: '#32CD32',
  },
  disabledText: {
    color: 'darkgray',
  },
  selectedButton: {
    backgroundColor: 'rgba(255, 255, 0,0.7)',
  },
});

export default QuizApp;