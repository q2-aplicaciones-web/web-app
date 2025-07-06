Project
Available Project Endpoints



GET
/api/v1/projects
Get Projects by User


Gets all projects for a specific user

Parameters
Try it out
Name	Description
userId
string($uuid)
(query)
userId
Responses
Code	Description	Links
200	
Projects found successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "string",
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "previewUrl": "string",
    "status": "string",
    "color": "string",
    "size": "string",
    "gender": "string",
    "layers": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "x": 0,
        "y": 0,
        "z": 0,
        "opacity": 0,
        "isVisible": true,
        "type": "string",
        "createdAt": "string",
        "updatedAt": "string",
        "details": {
          "additionalProp1": "string",
          "additionalProp2": "string",
          "additionalProp3": "string"
        }
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
]
No links
400	
User ID is required

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.819Z"
}
No links
404	
No projects found for user

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.820Z"
}
No links

POST
/api/v1/projects
Create Project


Creates a new design project

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "title": "string",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "garmentColor": "string",
  "garmentSize": "string",
  "garmentGender": "string"
}
Responses
Code	Description	Links
201	
Project created successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "string",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "previewUrl": "string",
  "status": "string",
  "color": "string",
  "size": "string",
  "gender": "string",
  "layers": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "x": 0,
      "y": 0,
      "z": 0,
      "opacity": 0,
      "isVisible": true,
      "type": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "details": {
        "additionalProp1": "string",
        "additionalProp2": "string",
        "additionalProp3": "string"
      }
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
No links
400	
Invalid input data

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.822Z"
}
No links

GET
/api/v1/projects/{projectId}
Get Project by ID


Gets a specific project by its ID

Parameters
Try it out
Name	Description
projectId *
string($uuid)
(path)
projectId
Responses
Code	Description	Links
200	
Project found successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "string",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "previewUrl": "string",
  "status": "string",
  "color": "string",
  "size": "string",
  "gender": "string",
  "layers": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "x": 0,
      "y": 0,
      "z": 0,
      "opacity": 0,
      "isVisible": true,
      "type": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "details": {
        "additionalProp1": "string",
        "additionalProp2": "string",
        "additionalProp3": "string"
      }
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
No links
400	
Invalid project ID format

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.825Z"
}
No links
404	
Project not found

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.825Z"
}
No links

DELETE
/api/v1/projects/{projectId}
Delete Project


Delete a project by its ID

Parameters
Try it out
Name	Description
projectId *
string($uuid)
(path)
projectId
Responses
Code	Description	Links
200	
Project deleted successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "message": "string",
  "timestamp": "2025-07-06T05:00:20.827Z"
}
No links
400	
Invalid project ID format

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.827Z"
}
No links
404	
Project not found

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.828Z"
}
No links
500	
Internal server error

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.828Z"
}
No links

PUT
/api/v1/projects/{projectId}/details
Update Product Details


Update the product details of a project

Parameters
Try it out
Name	Description
projectId *
string($uuid)
(path)
projectId
Request body

application/json
Example Value
Schema
{
  "previewUrl": "string",
  "status": "string",
  "garmentColor": "string",
  "garmentSize": "string",
  "garmentGender": "string"
}
Responses
Code	Description	Links
200	
Product details updated successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "message": "string",
  "timestamp": "2025-07-06T05:00:20.830Z"
}
No links
400	
Invalid input data

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.830Z"
}
No links
404	
Project not found

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.830Z"
}
No links
ProjectLayers
Available Project Layers Endpoints



POST
/api/v1/projects/{projectId}/texts
Create Text Layer


Creates a new text layer for the project

Parameters
Try it out
Name	Description
projectId *
string($uuid)
(path)
projectId
Request body

application/json
Example Value
Schema
{
  "text": "string",
  "fontColor": "string",
  "fontFamily": "string",
  "fontSize": 0,
  "isBold": true,
  "isItalic": true,
  "isUnderlined": true
}
Responses
Code	Description	Links
201	
Text layer created successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "x": 0,
  "y": 0,
  "z": 0,
  "opacity": 0,
  "isVisible": true,
  "type": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "details": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}
No links
400	
Invalid input data

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.833Z"
}
No links
403	
User not authorized

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.834Z"
}
No links
404	
Project not found

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.834Z"
}
No links
500	
Internal server error

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.835Z"
}
No links

POST
/api/v1/projects/{projectId}/images
Create Image Layer


Creates a new image layer for the project

Parameters
Try it out
Name	Description
projectId *
string($uuid)
(path)
projectId
Request body

application/json
Example Value
Schema
{
  "imageUrl": "string",
  "width": "string",
  "height": "string"
}
Responses
Code	Description	Links
201	
Image layer created successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "x": 0,
  "y": 0,
  "z": 0,
  "opacity": 0,
  "isVisible": true,
  "type": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "details": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}
No links
400	
Invalid input data

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.837Z"
}
No links
403	
User not authorized

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.837Z"
}
No links
404	
Project not found

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.838Z"
}
No links
500	
Internal server error

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.838Z"
}
No links

DELETE
/api/v1/projects/{projectId}/layers/{layerId}
Delete Layer


Deletes a specific layer from the project

Parameters
Try it out
Name	Description
projectId *
string($uuid)
(path)
projectId
layerId *
string($uuid)
(path)
layerId
Responses
Code	Description	Links
200	
Layer deleted successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "message": "string",
  "timestamp": "2025-07-06T05:00:20.840Z"
}
No links
400	
Invalid input data

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.840Z"
}
No links
403	
User not authorized

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.841Z"
}
No links
404	
Layer or project not found

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.841Z"
}
No links
500	
Internal server error

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.842Z"
}
No links

PUT
/api/v1/projects/{projectId}/layers/{layerId}/text-details
Update Text Layer Details


Updates the text properties of a text layer

Parameters
Try it out
Name	Description
projectId *
string($uuid)
(path)
projectId
layerId *
string($uuid)
(path)
layerId
Request body

application/json
Example Value
Schema
{
  "text": "string",
  "fontColor": "string",
  "fontFamily": "string",
  "fontSize": 0,
  "isBold": true,
  "isItalic": true,
  "isUnderlined": true
}
Responses
Code	Description	Links
200	
Text layer details updated successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "x": 0,
  "y": 0,
  "z": 0,
  "opacity": 0,
  "isVisible": true,
  "type": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "details": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}
No links
400	
Invalid input data or layer is not a text layer

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.844Z"
}
No links
403	
User not authorized

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.845Z"
}
No links
404	
Project or layer not found

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.845Z"
}
No links
500	
Internal server error

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.846Z"
}
No links

PUT
/api/v1/projects/{projectId}/layers/{layerId}/image-details
Update Image Layer Details


Updates the image properties of an image layer

Parameters
Try it out
Name	Description
projectId *
string($uuid)
(path)
projectId
layerId *
string($uuid)
(path)
layerId
Request body

application/json
Example Value
Schema
{
  "imageUrl": "string",
  "width": "string",
  "height": "string"
}
Responses
Code	Description	Links
200	
Image layer details updated successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "x": 0,
  "y": 0,
  "z": 0,
  "opacity": 0,
  "isVisible": true,
  "type": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "details": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}
No links
400	
Invalid input data or layer is not an image layer

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.849Z"
}
No links
403	
User not authorized

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.849Z"
}
No links
404	
Project or layer not found

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.850Z"
}
No links
500	
Internal server error

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "error": "string",
  "status": 0,
  "timestamp": "2025-07-06T05:00:20.850Z"
}