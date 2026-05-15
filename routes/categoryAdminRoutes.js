const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoryController.js');

/**
 * @swagger
 * tags:
 *   name: Admin Categories
 *   description: Admin category management APIs
 */

/**
 * @swagger
 * /api/v1/admin/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Current page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of categories per page
 *     responses:
 *       200:
 *         description: Categories returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *             example:
 *               data:
 *                 - id: 1
 *                   name: Movies
 *                   created_at: "2026-05-15T00:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 total_pages: 1
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: No categories found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                     message:
 *                       type: string
 *             example:
 *               error:
 *                 code: 404
 *                 message: No categories found
 *       500:
 *         description: Internal server error
 */
router.get('/', categoriesController.getAllCategories);

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 id: 1
 *                 name: Movies
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                     message:
 *                       type: string
 *             example:
 *               error:
 *                 code: 404
 *                 message: Khong tim thay danh muc voi ID da cho
 *       500:
 *         description: Internal server error
 */
router.get('/:id', categoriesController.getCategoryById);

/**
 * @swagger
 * /api/v1/admin/categories:
 *   post:
 *     summary: Create category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *           example:
 *             name: Movies
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 id: 1
 *                 name: Movies
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       400:
 *         description: Category name is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                     message:
 *                       type: string
 *             example:
 *               error:
 *                 code: 400
 *                 message: Ten danh muc la bat buoc
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', categoriesController.createCategory);

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *           example:
 *             name: Cartoons
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               data:
 *                 id: 1
 *                 name: Cartoons
 *                 created_at: "2026-05-15T00:00:00.000Z"
 *       400:
 *         description: Category name is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                     message:
 *                       type: string
 *             example:
 *               error:
 *                 code: 400
 *                 message: Ten danh muc la bat buoc
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                     message:
 *                       type: string
 *             example:
 *               error:
 *                 code: 404
 *                 message: Khong tim thay danh muc voi ID da cho
 *       500:
 *         description: Internal server error
 */
router.put('/:id', categoriesController.updateCategory);

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *             example:
 *               data:
 *                 message: Xoa danh muc thanh cong
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                     message:
 *                       type: string
 *             example:
 *               error:
 *                 code: 404
 *                 message: Khong tim thay danh muc voi ID da cho
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
