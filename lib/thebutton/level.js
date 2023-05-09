
const SCALE_LOW  =  5*60*1000;
const SCALE_MID  = 20*60*1000;
const SCALE_END = 60*60*1000;

const CAP_LOW = 10;
const CAP_MID = 20;

const TIME_CAP_LOW = CAP_LOW * SCALE_LOW;
const TIME_CAP_MID = TIME_CAP_LOW + ((CAP_MID - CAP_LOW) * SCALE_MID);

function calculateLevel(lastPressTime, now) {
    now = now ?? Date.now();

    if (!lastPressTime) {
        return 1;
    }
    
    const diff = now - (lastPressTime ?? now);

    if (diff <= TIME_CAP_LOW) {
        return Math.floor(diff / SCALE_LOW);
    }

    if (diff <= TIME_CAP_MID) {
        return CAP_LOW + Math.floor((diff - TIME_CAP_LOW) / SCALE_MID);
    }
    
    return TIME_CAP_MID + Math.floor((diff - TIME_CAP_MID) / SCALE_END);
}

function calculateTimeForLevel(level) {
    if (level <= CAP_LOW) {
        return SCALE_LOW * level;
    }

    if (level <= CAP_MID) {
        return (SCALE_LOW * CAP_LOW) + (SCALE_MID * (level - CAP_LOW));
    }

    return (SCALE_LOW * CAP_LOW) + (SCALE_MID * (CAP_MID - CAP_LOW)) + (SCALE_END * (level - CAP_MID));
}

function nextLevelTimeout(lastPressTime, now) {
    if (!lastPressTime) {
        return SCALE_LOW;
    }

    now = now ?? Date.now();
    const level = calculateLevel(lastPressTime, now);
    const diff = now - (lastPressTime ?? now);
    const time = calculateTimeForLevel(level + 1);

    return time - diff;
}

module.exports = {
    calculateLevel,
    nextLevelTimeout,
}