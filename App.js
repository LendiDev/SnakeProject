import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
  Vibration,
} from 'react-native';

const App = () => {
  const resetSnakeState = [
    {x: 200, y: 60, direction: 'left'},
    {x: 200, y: 80, direction: 'left'},
    {x: 200, y: 100, direction: 'left'},
    {x: 200, y: 120, direction: 'left'},
  ];
  const resetFoodState = {x: 200, y: 180};
  const [snakeCoordinates, setSnakeCoordinates] = useState(resetSnakeState);
  const [food, setFood] = useState(resetFoodState);
  const [currentDirection, setDirection] = useState('right');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highestScore, setHighestScore] = useState(0);
  const [newHigh, setNewHigh] = useState(false);

  const snakePixels = 20;
  const frameSize = Dimensions.get('window').width - 30;

  const popTail = () => {
    setSnakeCoordinates(snakeCoordinates.slice(1));
  };

  const getSnakeHead = () => {
    return snakeCoordinates[snakeCoordinates.length - 1];
  };

  const feedSnake = (x, y) => {
    snakeCoordinates.unshift({
      x: x,
      y: y,
    });
  };

  const addScore = () => {
    const newScore = 310 - speed + score;
    setSpeed(speed - 3);
    checkHighestScore(newScore);
    setScore(newScore);
  };

  const penaltyScore = () => {
    if (score > 100) {
      const newScore = Math.floor(score - 0.05 * snakeCoordinates.length);
      setScore(newScore);
    }
  };

  const checkIfFoodFound = () => {
    if (getSnakeHead().x === food.x && getSnakeHead().y === food.y) {
      feedSnake(food.x, food.y);
      addScore();
      generateFood();
    }
  };

  function checkGameOver(x, y) {
    snakeCoordinates.map(body => {
      if (body.x === x && body.y === y) {
        predictGameOver();
      }
    });
  }

  const generateFood = () => {
    const randomPixelX = Math.floor(
      Math.random() * (frameSize - (frameSize % 50)),
    );

    const randomPixely = Math.floor(
      Math.random() * (frameSize - (frameSize % 50)),
    );

    const coordX = randomPixelX - (randomPixelX % 20);
    const coordY = randomPixely - (randomPixely % 20);

    if (
      snakeCoordinates.some(
        element => element.x === coordX && element.y === coordY,
      )
    ) {
      generateFood();
    } else {
      setFood({x: coordX, y: coordY});
    }
  };

  const predictGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
  };

  useEffect(() => {
    if (isPlaying) {
      checkIfFoodFound();
      const interval = setInterval(() => {
        moveSnake(currentDirection);
      }, speed);

      return () => clearInterval(interval);
    }
  }, [snakeCoordinates, currentDirection, isPlaying, speed, food]);

  const moveSnake = (direction = null) => {
    if (!gameOver) {
      setIsPlaying(true);
    }

    const head = getSnakeHead();
    const goTo = !!direction ? direction : currentDirection;
    var x;
    var y;
    if (isPlaying && !gameOver) {
      penaltyScore();
      switch (goTo) {
        case 'up':
          if (head.x - snakePixels < 0) {
            predictGameOver();
          } else {
            x = head.x - snakePixels;
            y = head.y;
            checkGameOver(x, y);
            snakeCoordinates.push({
              x: x,
              y: y,
            });
          }
          break;
        case 'left':
          if (head.y - snakePixels < 0) {
            predictGameOver();
          } else {
            x = head.x;
            y = head.y - snakePixels;
            checkGameOver(x, y);
            snakeCoordinates.push({
              x: x,
              y: y,
            });
          }
          break;
        case 'right':
          if (head.y + snakePixels > frameSize - (frameSize % 50)) {
            predictGameOver();
          } else {
            x = head.x;
            y = head.y + snakePixels;
            checkGameOver(x, y);
            snakeCoordinates.push({
              x: x,
              y: y,
            });
          }
          break;
        case 'down':
          if (head.x + snakePixels > frameSize - (frameSize % 50)) {
            predictGameOver();
          } else {
            x = head.x + snakePixels;
            y = head.y;
            checkGameOver(x, y);
            snakeCoordinates.push({
              x: x,
              y: y,
            });
          }
      }
      popTail();
    }
  };

  const checkHighestScore = _score => {
    if (_score > highestScore) {
      setHighestScore(_score);
      setNewHigh(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    setSpeed(300);
    setGameOver(false);
    setNewHigh(false);
    setDirection('right');
    setIsPlaying(false);
    setFood(resetFoodState);
    setSnakeCoordinates(resetSnakeState);
  };

  const directionHandler = (direction: string, speed = 300) => {
    if (
      (currentDirection === 'up' && direction === 'down') ||
      (currentDirection === 'left' && direction === 'right') ||
      (currentDirection === 'down' && direction === 'up') ||
      (currentDirection === 'right' && direction === 'left')
    ) {
      return;
    }

    if (speed !== 300) {
      setSpeed(speed);
    }

    Vibration.vibrate(10);
    setDirection(direction);
    moveSnake(direction);
  };

  const playingHandler = playing => {
    setIsPlaying(playing);
  };

  return (
    <>
      <StatusBar backgroundColor="#ddd" barStyle="dark-content" />
      <SafeAreaView>
        <View style={styles.mainContainer}>
          <View style={styles.highScore}>
            <Text style={{fontSize: 20}}>Highest score: {highestScore}</Text>
          </View>
          <View style={gameStyles(Dimensions.get('window')).mainSnakeFrame}>
            <View
              key="food"
              style={{
                width: snakePixels - 5,
                height: snakePixels - 5,
                borderRadius: snakePixels / 2,
                backgroundColor: 'green',
                borderWidth: 0,
                position: 'absolute',
                marginTop: food.x + 2.5,
                marginLeft: food.y + 2.5,
              }}
            />
            {snakeCoordinates.map((pos, index) => {
              return (
                <>
                  <View
                    style={{
                      width: snakePixels,
                      height: snakePixels,
                      borderRadius: snakePixels / 4,
                      backgroundColor:
                        index === snakeCoordinates.length - 1
                          ? '#996515'
                          : '#CD7F32',
                      position: 'absolute',
                      marginTop: pos.x,
                      marginLeft: pos.y,
                    }}
                  />
                </>
              );
            })}
            {gameOver ? (
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: '#fff',
                  opacity: 0.8,
                  justifyContent: 'center',
                  alignText: 'center',
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    alignSelf: 'center',
                    fontSize: 50,
                    fontWeight: '700',
                  }}>
                  Game Over
                </Text>
                {newHigh ? (
                  <>
                    <Text
                      style={{
                        alignSelf: 'center',
                        fontSize: 25,
                        fontWeight: '600',
                      }}>
                      New High Score!
                    </Text>
                  </>
                ) : null}
              </View>
            ) : null}
          </View>
          <View style={styles.buttonsContainer}>
            <View style={[styles.fixToText, {justifyContent: 'space-between'}]}>
              <TouchableOpacity
                onPress={() => playingHandler(!isPlaying)}
                style={[
                  styles.appButtonContainerMove,
                  {marginRight: 10, width: 80},
                ]}
                disabled={gameOver ? true : false}>
                <Text style={{alignSelf: 'center'}}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              </TouchableOpacity>
              <View style={styles.score}>
                <Text style={styles.scoreText}>{score}</Text>
              </View>
              <TouchableOpacity
                onPress={() => resetGame()}
                style={[styles.appButtonContainerMove, {marginLeft: 0}]}>
                <Text>Reset</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.fixToText}>
              <TouchableOpacity
                onPress={() => directionHandler('up')}
                style={styles.appButtonContainerMoves}>
                <Text>UP</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.fixToText}>
              <TouchableOpacity
                onPress={() => directionHandler('left')}
                style={[styles.appButtonContainerMoves, {marginRight: 75}]}>
                <Text>LEFT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => directionHandler('right')}
                style={styles.appButtonContainerMoves}>
                <Text>RIGHT</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.fixToText}>
              <TouchableOpacity
                onPress={() => directionHandler('down')}
                style={styles.appButtonContainerMoves}>
                <Text>DOWN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const gameStyles = props =>
  StyleSheet.create({
    mainSnakeFrame: {
      marginTop: 20,
      width: props.width - 30,
      height: props.width - 30,
      borderColor: 'grey',
      backgroundColor: 'white',
      borderWidth: 0.5,
      borderRadius: 5,
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 50, height: 50},
      shadowOpacity: 1,
      shadowRadius: -45,
      marginBottom: 0,
      elevation: 20,
    },
  });

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ddd',
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  flexContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 45,
  },
  appButtonContainerMove: {
    height: 70,
    elevation: 8,
    margin: 10,
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  appButtonContainerMoves: {
    height: 90,
    width: 90,
    elevation: 8,
    margin: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  score: {
    alignSelf: 'center',
  },
  scoreText: {
    fontSize: 38,
    fontWeight: 'bold',
  },
  highScore: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: -5,
    marginLeft: 15,
  },
});

export default App;
