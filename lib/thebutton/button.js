const { formatDistance }  = require('date-fns');

function calculateLevel(lastClick, now) {
    now = now ?? Date.now();

    if (!lastClick) {
        return 1;
    }
    
    const time = now - (lastClick ?? now);
       
    const lowScale = 5*60*1000;
    const midScale = 20*60*1000;
    const highScale = 60*60*1000;

    const lowLevelCap = 10;
    const midLevelCap = 20;

    const lowTimeCap = lowLevelCap * lowScale;
    const midTimeCap = lowTimeCap + ((midLevelCap-lowLevelCap) * midScale);

    if (time <= lowTimeCap) {
        return Math.floor(time / lowScale);
    }

    if (time <= midTimeCap) {
        return lowLevelCap + Math.floor((time - lowTimeCap) / midScale);
    }
    
    return midTimeCap + Math.floor((time - midTimeCap) / highScale);
}


function getStatusMsg(lastClick, currentLevel) {    
    const level = calculateLevel(lastClick);
    if (level === 0) {
        return `The button is not flashing.`;
    }
    
    if (!lastClick) {
        return `The button has never been clicked before and is occasionally flashing invitingly.`;   
    } 
    
    const timeFormated = formatDistance(lastClick, Date.now(), { addSuffix: true, includeSeconds: true });        
    const timeMsg = `The button was last pressed ${timeFormated}`;
    
    let msg = `${timeMsg}. It is occasionally flashing ${level} times in a row, before again waiting to be pressed.`;  
    if (level - currentLevel > 10) {
        msg += ` The button looks extremely tempting to you now.`;
    } else if (level - currentLevel > 5) {
        msg += ` The button looks real tempting to you now.`;
    } else if (level - currentLevel > 0) {
        msg += ` The button is starting to look tempting to you.`;
    }

    return msg;
}

function getPressedMsg(lastClick, now) {    
    const level = calculateLevel(lastClick);
    if (level === 0) {
        return `The button was not flashing. Nothing is happening.`;
    }

    if (!lastClick) {
        return `The button beeps and flashes once, then resets.`;
    }
        
    return `The button beeps and flashes ${level} times in a row, then resets.`;
}

module.exports = {
    calculateLevel,
    getStatusMsg,
    getPressedMsg,
}