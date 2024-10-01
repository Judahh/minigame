

const hiddenElement = document.getElementById('hidden-div');

function addPx(value) {
    return value ? typeof value === 'string' && value.includes('px') ? value : value + 'px' : value;
}

function getObjectArray(className) {
    const htmlCollection = document.getElementsByClassName(className);
    return htmlCollection;
}

function spawn(className, right, bottom, height, width) {
    //console.log('spawnObject', className, right, bottom, height, width);
    const index = getObjectArray(className).length;
    const object = document.createElement('div');
    object.classList.add(className);
    object.classList.add('object');
    object.id = index + '-' + className;
    if (right || right == 0) {
        object.style.right = right;
    }
    if (bottom || bottom == 0) {
        object.style.bottom = bottom;
    }
    if (height || height == 0) {
        object.style.height = height;
    }
    if (width || width == 0) {
        object.style.width = width;
    }
    gameContainerElement.appendChild(object);

    // check if there is a collision with an existing object
    const allObjects = getObjectArray('object');
    for (const currentObject of allObjects) {
        if (currentObject === object) {
            continue;
        }
        checkCollision(currentObject, object, 0, 0, destroyObject, className, object.id.replace('-'+className, ''));
    }

    return object;
}

function destroyObject(className, index) {
    document.getElementById(index+'-'+className).remove();
    //console.log('destroyObject', index, className);
}

function destroyAllObjects(className) {
    const objectArray = getObjectArray(className);
    //console.log('destroyAllObjects', className, objectArray, objectArray.length);
    for (const object of objectArray) {
        destroyObject(className, object.id.replace('-'+className, ''));
    }
}

function addScore(points) {
    score += points;
    scoreElement.innerHTML = parseInt(score);
    if (score > highScore) {
        highScore = parseInt(score);
        document.getElementById('high-score').innerHTML = highScore;
    }
}

function getElementProperties(element) {
  const bottom = parseInt(window.getComputedStyle(element).getPropertyValue('bottom'));
  const right = parseInt(window.getComputedStyle(element).getPropertyValue('right'));
  const width = parseInt(window.getComputedStyle(element).getPropertyValue('width'));
  const height = parseInt(window.getComputedStyle(element).getPropertyValue('height'));
  const top = bottom + height;
  const left = right + width;

  return { bottom, right, width, height, top, left };
}

function removeNaNProperties(object) {
  return Object.keys(object).reduce((acc, key) => {
    if (!isNaN(object[key])) {
      acc[key] = object[key];
    }
    return acc;
  }, {});
}

function getCollisionElementProperties(object, className){
    const baseProperties = getElementProperties(object);
    if(className) {
        try {
            const cObject = document.createElement('div');
            cObject.classList.add(className);
            hiddenElement.appendChild(cObject);
            const properties = removeNaNProperties(getElementProperties(cObject));
            delete properties.bottom;
            delete properties.right;
            delete properties.top;
            delete properties.left;
            console.log('getCollisionElementProperties', className, baseProperties, properties);
            hiddenElement.removeChild(cObject);
            const newProperties = { ...baseProperties, ...properties };
            const lastWidth = baseProperties.width;
            const lastHeight = baseProperties.height;
            const widthDiff = newProperties.width - lastWidth;
            const heightDiff = newProperties.height - lastHeight;

            newProperties.bottom = newProperties.bottom - heightDiff/2;
            newProperties.right = newProperties.right + widthDiff/2;

            newProperties.top = newProperties.bottom + newProperties.height;
            newProperties.left = newProperties.right + newProperties.width;
            return newProperties
        } catch (error) {
            return baseProperties;
        }
    }

    return baseProperties;
}

// Check for collision
function checkCollision(firstElement, secondElement, firstCollision, secondCollision, onCollision, ...params) {
  //console.log('checkCollision', getCollisionElementProperties(firstElement, firstElement.classList[0]), secondElement);
  const first = getCollisionElementProperties(firstElement,firstCollision);
  const second = getCollisionElementProperties(secondElement, secondCollision);
  if (secondCollision)
    console.log('checkCollision', first, second);

  if(isNaN(second.top) || isNaN(second.bottom) || isNaN(second.left) || isNaN(second.right) ||
     isNaN(first.top) || isNaN(first.bottom) || isNaN(first.left) || isNaN(first.right)) {
    return false;
  }

  // Vertical collision
  if(!(second.top <= (first.bottom) || second.bottom > (first.top))) {
    // Horizontal collision
    if (!(second.left < (first.right)|| second.right > (first.left))) {
        onCollision?.(...params);
        return true;
    }
  }

  return false;
}

function gameOver() {
    isGameOver = true;
    if (score >= winScore) {
        winElement.classList.remove('hidden');
    } else {
        gameOverElement.classList.remove('hidden');
    }
    clearInterval(gameInterval);
}