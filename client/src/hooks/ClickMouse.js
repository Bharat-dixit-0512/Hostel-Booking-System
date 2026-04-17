const keysound=new Audio('/mouse-click.mp3');

export const useClickMouse = () => {
    const playClickSound = () => {
        keysound.currentTime = 0;
        keysound.volume = 0;
        keysound.play();

    };

    return playClickSound;
}