const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const prisma = require("../db/index")

router.get("/", async (req, res) => {
  try {
    const groups = await prisma.Group.findMany({
      include: {
        admins: true,           
        members: true,          
        categories: true,       
      },
    });
    res.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

router.post('/group/create', groupController.createGroup);

router.put("/group/:groupId/update",  groupController.updateGroupDetails);

router.delete("/group/:groupId/delete", groupController.deleteGroup);

router.get('/:groupId/details', groupController.getDetailsOfGroup);

router.get("/:groupId/users", groupController.getAllUsers);

router.get("/:groupId/admins", groupController.getAllAdmins);

router.post('/group/:groupId/user/add', groupController.addGroupMember);

router.post('/group/:groupId/admin/add', groupController.addNewAdmin);

router.delete("/group/:groupId/member/:userId/remove",  groupController.removeGroupMember);

module.exports = router;
