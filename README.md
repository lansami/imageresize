# imageresizer
Microservice for resizing the images

The microservice is built using Node.js and provides routes that can be used for getting or resizing images.

Before starting the application you should set the **config.json** file with the paths to the resources(**resourcesPath**) and images(**imagesPath**) or you can set the enviroment variables **RESOURCESPATH** where resources can be found and **IMAGESPATH** where images can be found.

The microservice starts on port **3000** if not assigned an enviroment variable *PORT*

## Routes

### '/' 

This route provides the statistics about the usage of the service. The informations that will be shown are cache hits/miss, number of original files, number of resized files.(http://localhost:3000/)

### '/stats'

This route provide the same statistics about the usage of the service but it will return a JSON object that is containing all the statistics.(http://localhost:3000/stats)

### '/image'

This route will provide the image returned from the server. If the query parameter **size** is set then it will resize the image to the desired resolution. You can also set the query parameter **keep_aspect_ratio** to true or false for keeping the aspect ratio of the image. The resize of the image is done using the **sharp** module, it is a very powerful image processing module.(http://localhost:3000/image/some_image.jpg?size=300x900&keep_aspect_ratio=true)

## How to install the service

You can get the repository by executing the **git clone** command in the folder that you want to clone the repository:

> git clone https://github.com/lansami/imageresize.git

### How to run locally

Open a terminal in the folder that you cloned the repository and execute the command:

> npm install

This will install all the required dependencies

After all dependencies were succesfully installed execute the command:

>npm start

This command will compile the code in typescript and output the code in the **dist** and after that the application will start 

Tha server will listen on port 3000, but this can be changed by creating an enviroment variable **PORT**

## Executing tests
Open a terminal in the folder with the microservice and execute the command:

>npm test

Unit tests are done using mocha.