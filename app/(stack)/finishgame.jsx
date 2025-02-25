import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity, BackHandler, ToastAndroid } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import celebrationAnimation from '../../assets/celebration.json';
import { Audio } from 'expo-av';
import winSound from '../../assets/win.mp3';

export default function FinalGame() {
  const params = useLocalSearchParams();
  console.log(params);
  const score = params.score || "";
  const questionum = params.count || "";

  const animationRef = useRef(null);
  const [exitApp, setExitApp] = useState(false);
  const [sound, setSound] = useState();

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(winSound);
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    playSound();
    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const backAction = () => {
      router.replace('/welcome');
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [exitApp]);

  const stopMusic = async () => {
    if (sound) {
      await sound.stopAsync();
    }
  };

  return (

    
    <SafeAreaView style={styles.container}>
       <LottieView
          ref={animationRef}
          style={styles.explosion}
          source={celebrationAnimation}
          autoPlay
          loop={true}
        />
      <View style={styles.svgContainer}>
        <Svg
          width={320}
          height={180}
          viewBox="0 0 360 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Text style={styles.text}>🎉 Təbriklər! 🎉</Text>
          <Path
            opacity="0.7"
            d="M4.82843 130C3.04662 130 2.15428 127.846 3.41421 126.586L28.5858 101.414C29.3668 100.633 29.3668 99.3668 28.5858 98.5858L3.41421 73.4142C2.15428 72.1543 3.04662 70 4.82843 70L355.172 70C356.953 70 357.846 72.1543 356.586 73.4142L331.414 98.5858C330.633 99.3668 330.633 100.633 331.414 101.414L356.586 126.586C357.846 127.846 356.953 130 355.172 130L4.82843 130Z"
            fill="#006AFF"
          />
          <Path
            d="M173.765 4.97212C177.413 2.06323 182.587 2.06323 186.235 4.97212L193.129 10.4699C195.663 12.4904 199.018 13.1579 202.132 12.2608L210.605 9.8197C215.088 8.52813 219.869 10.5083 222.126 14.5917L226.391 22.3092C227.959 25.1455 230.804 27.0463 234.024 27.4091L242.786 28.3964C247.422 28.9188 251.081 32.5777 251.604 37.2139L252.591 45.9762C252.954 49.1965 254.855 52.0412 257.691 53.6088L265.408 57.8741C269.492 60.1309 271.472 64.9115 270.18 69.3947L267.739 77.8679C266.842 80.9818 267.51 84.3375 269.53 86.8711L275.028 93.7651C277.937 97.4128 277.937 102.587 275.028 106.235L269.53 113.129C267.51 115.663 266.842 119.018 267.739 122.132L270.18 130.605C271.472 135.088 269.492 139.869 265.408 142.126L257.691 146.391C254.855 147.959 252.954 150.804 252.591 154.024L251.604 162.786C251.081 167.422 247.422 171.081 242.786 171.604L234.024 172.591C230.804 172.954 227.959 174.855 226.391 177.691L222.126 185.408C219.869 189.492 215.088 191.472 210.605 190.18L202.132 187.739C199.018 186.842 195.663 187.51 193.129 189.53L186.235 195.028C182.587 197.937 177.413 197.937 173.765 195.028L166.871 189.53C164.337 187.51 160.982 186.842 157.868 187.739L149.395 190.18C144.912 191.472 140.131 189.492 137.874 185.408L133.609 177.691C132.041 174.855 129.196 172.954 125.976 172.591L117.214 171.604C112.578 171.081 108.919 167.422 108.396 162.786L107.409 154.024C107.046 150.804 105.145 147.959 102.309 146.391L94.5917 142.126C90.5083 139.869 88.5281 135.088 89.8197 130.605L92.2608 122.132C93.1579 119.018 92.4904 115.663 90.4699 113.129L84.9721 106.235C82.0632 102.587 82.0632 97.4128 84.9721 93.7651L90.4699 86.8711C92.4904 84.3375 93.1579 80.9818 92.2608 77.8679L89.8197 69.3947C88.5281 64.9115 90.5083 60.1309 94.5917 57.8741L102.309 53.6088C105.145 52.0412 107.046 49.1965 107.409 45.9762L108.396 37.2139C108.919 32.5777 112.578 28.9188 117.214 28.3964L125.976 27.4091C129.196 27.0463 132.041 25.1455 133.609 22.3092L137.874 14.5917C140.131 10.5083 144.911 8.52813 149.395 9.8197L157.868 12.2608C160.982 13.1579 164.337 12.4904 166.871 10.4699L173.765 4.97212Z"
            fill="#006AFF"
          />
          <Circle cx="180" cy="100" r="70" fill="white" />
          <SvgText
            fontWeight='bold'
            x="180"
            y="80"
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="24"
            fill="black"
          >
            {score}
          </SvgText>
          <SvgText
            fontWeight='bold'
            x="180"
            y="120"
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="24"
            fill="black"
          >
            {"bal"}
          </SvgText>
        </Svg>
        <Text style={styles.questionsCount}>Cavablandırılmış sualların sayı: {questionum}</Text>

      </View>
      <View style={{
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
      }}>
        <TouchableOpacity style={[styles.buttons]} onPress={async()=>{
          await stopMusic()
          router.replace('/home')}}>
          <Text style={[styles.buttonsText, { color: 'white' }]}>Yeni oyuna başla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttons, { backgroundColor: 'white' }]} onPress={async()=>{
          await stopMusic()
          router.replace('/welcome')}}>
          <Text style={[styles.buttonsText]}>Əsas səhifəyə qayıt</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#006AFF',
    opacity: 0.9,
    paddingTop: StatusBar.currentHeight
  },
  textContainer: {
    marginTop: StatusBar.currentHeight || 0,
    padding: 10,
  },
  text: {
    fontSize: 32,
    color: 'black',
    top: -70,
    textAlign: 'center',
    fontWeight: 'bold'


  },
  svgContainer: {
    marginTop: 20, 
    height: '50%',
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    padding: 15,
    opacity: 0.9,
    width: '90%',
    marginTop: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  buttonsText: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  questionsCount: {
    textAlign: 'center',
    fontWeight: 'bold',
    opacity: 0.6,
    bottom: -70
  },
  explosion: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});
