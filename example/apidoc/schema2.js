/**
 * @apiDefine admin User access only
 * This optional description belong to to the group admin.
 */
/**
 * @apiDeprecated use now (#Group:Name).
 * @apiVersion 1.6.2
 * @api {get} todos/:id Get account info
 * @apiName GetAccount
 * @apiGroup Account
 * @apiPermission admin
 * @apiPermission aaa
 * 
 * @apiSampleRequest https://jsonplaceholder.typicode.com
 * @apiHeader {String} access-key="TOTO" Users unique access-key.
 * @apiHeader {String} access-key2 Users unique access-key.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Accept-Encoding": "Accept-Encoding: gzip, deflate"
 *     }
 * @apiDescription ceci est une description de ouf blalalaaa <code>aa</code>
 * @apiParamExample {json} Request-Example:
 *     {
 *       "id": 4711
 *     }
 * @apiParam {String} id ressource to use
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 * @apiSuccess (200) {String} firstname Firstname of the User.
 * @apiSuccess (200) {String} lastname  Lastname of the User.
 * @apiSuccess {Boolean} active        Specify if the account is active.
 * @apiSuccess {Object}  profile       User profile information.
 * @apiSuccess {Number}  profile.age   Users age.
 * @apiSuccess {String}  profile.image Avatar-Image.
 * @apiSuccess {Object[]} profiles       List of user profiles.
 * @apiSuccess {Number}   profiles.age   Users age.
 * @apiSuccess {String}   profiles.image Avatar-Image.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 *
 * @apiError UserNotFound The <code>id</code> of the User was not found.
 * @apiError BALLALAANotFound The <code>id</code> of the aaaa was not found.
 * @apiError (UserNotFound) {Number} test The <code>id</code> of the aaaa was not found.

 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 *
 */


 /**
 * @apiDefine admin User access only
 * This optional description belong to to the group admin.
 */
/**
 * @apiDeprecated use now (#Group:Name).
 * @apiVersion 1.6.2
 * @api {post} /acount/:id/filter/toto/:param2/fdfd/:name Create an account
 * @apiName CreateAccount
 * @apiGroup Account
 * @apiPermission admin
 * @apiPermission aaa
 * 
 * @apiSampleRequest http://test.github.com/some_path/
 * @apiHeader {String} access-key="TOTO" Users unique access-key.
 * @apiHeader {String} access-key2 Users unique access-key.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Accept-Encoding": "Accept-Encoding: gzip, deflate"
 *     }
 * @apiDescription ceci est une description de ouf blalalaaa <code>aa</code>
 * @apiParamExample {json} Request-Example:
 *     {
 *       "id": 4711
 *     }
 * @apiParam {String} [firstname]  Optional Firstname of the User.
 * @apiParam {String} lastname     Mandatory Lastname.
 * @apiParam {String} country="DE" Mandatory with default value "DE".
 * @apiParam {Number} [age=18]     Optional Age with default 18.
 * @apiParam {number=1,2,3,99,18} [choices=18]     Optional Age with default 18.
 *
 * @apiParam (Login) {String} pass Only logged in users can post this.
 *                                 In generated documentation a separate
 *                                 "Login" Block will be generated.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 * @apiSuccess (200) {String} firstname Firstname of the User.
 * @apiSuccess (200) {String} lastname  Lastname of the User.
 * @apiSuccess {Boolean} active        Specify if the account is active.
 * @apiSuccess {Object}  profile       User profile information.
 * @apiSuccess {Number}  profile.age   Users age.
 * @apiSuccess {String}  profile.image Avatar-Image.
 * @apiSuccess {Object[]} profiles       List of user profiles.
 * @apiSuccess {Number}   profiles.age   Users age.
 * @apiSuccess {String}   profiles.image Avatar-Image.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 *
 * @apiError UserNotFound The <code>id</code> of the User was not found.
 * @apiError BALLALAANotFound The <code>id</code> of the aaaa was not found.
 * @apiError (UserNotFound) {Number} test The <code>id</code> of the aaaa was not found.

 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 *
 */