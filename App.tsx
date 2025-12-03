import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Dimensions,
  StatusBar 
} from "react-native";

const GRID_SIZE = 20;
const SCORE_PER_FOOD = 10;

const DIFFICULTY_LEVELS = {
    EASY: 120,    
    NORMAL: 75,   
    HARD: 45,     
};

const { width, height } = Dimensions.get("window");


const boardWidth = width; 
const boardHeight = height * 0.85; 
const numCols = Math.floor(boardWidth / GRID_SIZE);
const numRows = Math.floor(boardHeight / GRID_SIZE);


export default function App() {
  const [screen, setScreen] = useState("menu"); 
  const [snake, setSnake] = useState([]);
  const [direction, setDirection] = useState("UP");
  const [food, setFood] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOverText, setGameOverText] = useState("");
  const [speed, setSpeed] = useState(DIFFICULTY_LEVELS.NORMAL); 
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isPlaying && !isPaused) { 
      intervalRef.current = setInterval(() => moveSnake(), speed); 
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, isPaused, direction, speed]); 

  const generateFood = (snakeBody) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * numCols),
        y: Math.floor(Math.random() * numRows),
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  const moveSnake = () => {
    setSnake((prevSnake) => {
      if (prevSnake.length === 0) return prevSnake;

      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      if (direction === "UP") head.y -= 1;
      if (direction === "DOWN") head.y += 1;
      if (direction === "LEFT") head.x -= 1;
      if (direction === "RIGHT") head.x += 1;

    
      if (
        head.x < 0 || head.y < 0 ||
        head.x >= numCols || head.y >= numRows ||
        newSnake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        gameOver();
        return prevSnake;
      }

      newSnake.unshift(head);

     
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + SCORE_PER_FOOD);
        generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const startGame = (selectedSpeed) => {
    const newSpeed = selectedSpeed !== undefined ? selectedSpeed : speed;
    setSpeed(newSpeed); 
    
    setSnake([
      { x: Math.floor(numCols/2), y: Math.floor(numRows/2) },
      { x: Math.floor(numCols/2), y: Math.floor(numRows/2) + 1 },
      { x: Math.floor(numCols/2), y: Math.floor(numRows/2) + 2 },
    ]);
    setDirection("UP");
    generateFood([
      { x: Math.floor(numCols/2), y: Math.floor(numRows/2) },
      { x: Math.floor(numCols/2), y: Math.floor(numRows/2) + 1 },
      { x: Math.floor(numCols/2), y: Math.floor(numRows/2) + 2 },
    ]);
    setScore(0);
    setIsPlaying(true);
    setIsPaused(false); 
    setGameOverText("");
    setScreen("game"); 
  };

  const gameOver = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    setIsPaused(false); 
    setGameOverText(💀 Game Over! Puntaje: ${score});
  };

  const togglePause = () => {
    if (isPlaying) {
      setIsPaused(prev => !prev);
    }
  }

  const resumeGame = () => {
    setIsPaused(false);
  };
  

  const handleTouchStart = (e) => {
    if (isPlaying && !isPaused) {
        const { locationX, locationY } = e.nativeEvent;
        touchStart.current = { x: locationX, y: locationY };
    }
  };

  const handleTouchEnd = (e) => {
    if (isPlaying && !isPaused) {
        const { locationX, locationY } = e.nativeEvent;
        touchEnd.current = { x: locationX, y: locationY };

        const dx = touchEnd.current.x - touchStart.current.x;
        const dy = touchEnd.current.y - touchStart.current.y;

        const isHorizontal = Math.abs(dx) > Math.abs(dy);

        if (isHorizontal) {
          if (dx > 0 && direction !== "LEFT") setDirection("RIGHT");
          else if (dx < 0 && direction !== "RIGHT") setDirection("LEFT");
        } else {
          if (dy > 0 && direction !== "UP") setDirection("DOWN");
          else if (dy < 0 && direction !== "DOWN") setDirection("UP");
        }
    }
  };




  const renderGameScreen = () => (
    <View style={styles.gameContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#c7e9b0" />

      {/* Encabezado con Puntaje y Pausa */}
      <View style={styles.header}>
        <View style={styles.headerItem}>
            <Text style={styles.headerIcon}>Ⓒ</Text>
            <Text style={styles.headerTime}>9:16</Text> 
        </View>
        <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
            <Text style={styles.pauseButtonText}>{isPlaying && !isPaused ? "||" : "▶"}</Text> 
        </TouchableOpacity>
        <View style={styles.headerItem}>
            <Text style={styles.headerIcon}>🍎</Text>
            <Text style={styles.headerScore}>{score}</Text>
        </View>
      </View>

      {/* Tablero del Juego (Pantalla Completa) */}
      <View
        style={[styles.board, { width: boardWidth, height: boardHeight }]}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Serpiente */}
        {snake.map((segment, index) => (
          <View
            key={index}
            style={[
          
              { left: segment.x * GRID_SIZE, top: segment.y * GRID_SIZE },
              
       
              styles.snakeSegmentBase,

             
              index === 0 
                ? [styles.snakeHead, styles[head_${direction}]] 
                : styles.snakeBody 
            ]}
          >
            {/* ✅ Ojos/Detalles de la cabeza (SOLO si es la cabeza) */}
            {index === 0 && (
                <View style={styles.eyeContainer}>
                    <View style={styles.eye} />
                    <View style={styles.eye} />
                </View>
            )}
          </View>
        ))}

        {/* Comida (Manzana) */}
        <Text
          style={[
            styles.foodIcon,
            { left: food.x * GRID_SIZE, top: food.y * GRID_SIZE },
          ]}
        >
          🍎
        </Text>

        {/* --- LÓGICA DE SUPERPOSICIÓN CENTRAL --- */}

        {/* 1. Superposición de Game Over */}
        {(!isPlaying && gameOverText !== "") && (
          <View style={styles.overlayCentered}>
              <Text style={styles.gameOverTextBig}>{gameOverText}</Text>
              
              <View style={styles.gameOverButtonsContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.shadow, styles.gameOverButton]}
                    onPress={() => startGame(speed)}
                >
                    <Text style={styles.buttonTextSmall}>Reiniciar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.shadow, styles.gameOverButton, styles.menuButton]}
                    onPress={() => setScreen('menu')}
                >
                    <Text style={styles.buttonTextSmall}>Menú</Text>
                </TouchableOpacity>
              </View>
          </View>
        )}
        
        {/* 2. Superposición de Pausa */}
        {(isPlaying && isPaused) && (
          <View style={styles.overlayCentered}>
              <Text style={styles.pauseTextBig}>Juego Pausado</Text>
              
              <View style={styles.gameOverButtonsContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.shadow, styles.pauseButtonBig]}
                    onPress={resumeGame}
                >
                    <Text style={styles.buttonTextSmall}>Continuar</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.gameOverButtonsContainer, { marginTop: 15 }]}>
                <TouchableOpacity
                    style={[styles.button, styles.shadow, styles.gameOverButton]}
                    onPress={() => startGame(speed)}
                >
                    <Text style={styles.buttonTextSmall}>Reiniciar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.shadow, styles.gameOverButton, styles.menuButton]}
                    onPress={() => setScreen('menu')}
                >
                    <Text style={styles.buttonTextSmall}>Menú</Text>
                </TouchableOpacity>
              </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderMenuScreen = () => (
    <View style={styles.menuContainer}>
        <Text style={styles.title}>🐍 Snake Game</Text>
        
        <View style={styles.menuContentCentered}>
            <Text style={styles.menuText}>Selecciona Nivel</Text>
            <Text style={styles.score}>Último Puntaje: {score}</Text>

            <View style={styles.difficultyButtonsContainer}>
                <TouchableOpacity
                    style={[styles.difficultyButton, speed === DIFFICULTY_LEVELS.EASY && styles.difficultyButtonSelected]}
                    onPress={() => startGame(DIFFICULTY_LEVELS.EASY)}
                >
                    <Text style={styles.difficultyButtonText}>Fácil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.difficultyButton, speed === DIFFICULTY_LEVELS.NORMAL && styles.difficultyButtonSelected]}
                    onPress={() => startGame(DIFFICULTY_LEVELS.NORMAL)}
                >
                    <Text style={styles.difficultyButtonText}>Normal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.difficultyButton, speed === DIFFICULTY_LEVELS.HARD && styles.difficultyButtonSelected]}
                    onPress={() => startGame(DIFFICULTY_LEVELS.HARD)}
                >
                    <Text style={styles.difficultyButtonText}>Difícil</Text>
                </TouchableOpacity>
            </View>
        </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {screen === 'menu' ? renderMenuScreen() : renderGameScreen()}
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#d5f5c5", 
  },
  
  menuContainer: {
    flex: 1,
    backgroundColor: "#f5f0e6",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  menuContentCentered: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2f6f39",
    marginBottom: 40,
  },
  menuText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2f6f39',
    marginBottom: 10,
  },
  score: {
    fontSize: 20,
    color: "#2f6f39",
    marginBottom: 40,
  },
  difficultyButtonsContainer: {
    flexDirection: 'column', 
    justifyContent: 'center',
    width: '90%',
    maxWidth: 250,
  },
  difficultyButton: {
    backgroundColor: "#77a382",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#77a382',
    minWidth: 100,
    alignItems: 'center',
    marginBottom: 15,
  },
  difficultyButtonSelected: {
    backgroundColor: "#2f6f39",
    borderColor: '#1e4a28',
  },
  difficultyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },

  gameContainer: {
    flex: 1,
    backgroundColor: "#d5f5c5", 
    alignItems: "center",
    justifyContent: "flex-start", 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#c7e9b0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  pauseButton: {
    padding: 5,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderColor: '#2f6f39',
    borderWidth: 2,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 18,
    color: '#2f6f39',
    fontWeight: 'bold',
  },
  board: {
    position: "relative",
    overflow: "hidden",
    borderTopWidth: 5, 
    borderBottomWidth: 5,
    borderColor: '#4a8a54',
    flexGrow: 1, 
    backgroundColor: "#c7e9b0", 
  },
  
  snakeSegmentBase: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    position: "absolute",
    borderWidth: 1, 
    borderColor: '#1e4a28',
  },
  snakeBody: {
    backgroundColor: "#4a8a54", 
    borderRadius: 5, 
  },
  snakeHead: {
    backgroundColor: "#2f6f39", 
    borderRadius: GRID_SIZE / 2, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  head_UP: { transform: [{ rotate: '0deg' }] },
  head_DOWN: { transform: [{ rotate: '180deg' }] },
  head_LEFT: { transform: [{ rotate: '-90deg' }] },
  head_RIGHT: { transform: [{ rotate: '90deg' }] },

  
  eyeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  eye: {
    width: 3,
    height: 3,
    backgroundColor: 'white',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'black',
  },

  
  foodIcon: { 
    fontSize: GRID_SIZE * 0.8, 
    position: "absolute",
    textAlign: 'center',
    lineHeight: GRID_SIZE,
    width: GRID_SIZE, 
    height: GRID_SIZE, 
  },

  overlayCentered: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(199, 233, 176, 0.9)', 
    padding: 20,
  },
  pauseTextBig: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2f6f39",
    marginBottom: 30,
    textAlign: 'center',
  },
  gameOverTextBig: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#a33",
    marginBottom: 30,
    textAlign: 'center',
  },
  gameOverButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 400,
  },
  pauseButtonBig: {
    backgroundColor: '#007bff', 
    width: '100%',
    marginHorizontal: 10,
  },
  gameOverButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#2f6f39',
  },
  menuButton: {
    backgroundColor: '#9a703d',
  },
  buttonTextSmall: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: 'center',
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
});