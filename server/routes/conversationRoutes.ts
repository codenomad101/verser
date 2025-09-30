import { Router } from 'express';
import { ConversationController } from '../controllers/conversationController';
import { authenticateToken } from '../auth';

const router = Router();

// Conversation routes
router.get('/', ConversationController.getAllConversations);
router.post('/', ConversationController.createConversation);
router.get('/:id/messages', ConversationController.getConversationMessages);
router.post('/messages', ConversationController.createMessage);

// Chat request routes
router.get('/chat-requests', authenticateToken, ConversationController.getIncomingChatRequests);
router.post('/chat-requests', authenticateToken, ConversationController.createChatRequest);
router.post('/chat-requests/:id/accept', authenticateToken, ConversationController.acceptChatRequest);
router.post('/chat-requests/:id/reject', authenticateToken, ConversationController.rejectChatRequest);

export default router;
