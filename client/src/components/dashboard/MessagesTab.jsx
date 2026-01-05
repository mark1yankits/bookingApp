import { MessageSquare, Send, ArrowLeft, RefreshCw, Search, Phone, Video, MoreVertical, ChevronLeft, Image as ImageIcon, Smile, Paperclip, Check, CheckCheck, PhoneOff, VideoOff, X, File, Download } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/api'

const MessagesTab = ({ messagesData, messagesLoading, onSendMessage, onMarkAsRead, initialPropertyId, initialProperty, isSendingMessage, isFetchingMessages, onRefresh }) => {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [showNewMessageToast, setShowNewMessageToast] = useState(false)
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [userPhone, setUserPhone] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Emoji list for picker
  const emojis = ['😀', '😂', '😊', '😍', '🥰', '😘', '😉', '😎', '🤔', '😮', '😢', '😭', '😤', '😅', '🙂', '😌', '😔', '😪', '🤗', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😱', '🤭', '🤫', '🤥', '😴', '🤤', '😵', '🤯', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚️', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕️', '🛑', '⛔️', '📛', '🚫', '💯', '🔟', '🔢', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫️', '⚪️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛️', '⬜️', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛️', '⬜️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇺🇦', '🇺🇸', '🇬🇧', '🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇯🇵', '🇰🇷', '🇨🇳', '🇷🇺', '🇮🇳', '🇧🇷', '🇲🇽', '🇨🇦', '🇦🇺', '🇳🇿', '🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🧭', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🪨', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪️', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲️', '⛺️', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🚏', '🛣️', '🛤️', '🛢️', '⛽️', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓️', '⛵️', '🛶', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🛎️', '🔔', '⏰', '🕰️', '⌛️', '⏳', '📻', '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📽️', '🎬', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '🪙', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '💹', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '📰', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔪', '🗡️', '🛡️', '🔧', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🪝', '🧰', '🧲', '🪜', '⚗️', '🧪', '🧫', '🧬', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩼', '🩺', '🩻', '🚪', '🛗', '🪞', '🪟', '🛏️', '🛋️', '🪑', '🚽', '🪠', '🚿', '🛁', '🪤', '🪒', '🧴', '🧷', '🧹', '🧺', '🧻', '🪣', '🧼', '🫧', '🧽', '🧯', '🛒', '🚬', '⚰️', '🪦', '⚱️', '🗿', '🪆', '🏺', '🔮', '📿', '🧿', '💎', '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎵', '🎶', '💹', '🏧', '🚮', '🚰', '♿️', '🚹', '🚺', '🚻', '🚼', '🚾', '🛂', '🛃', '🛄', '🛅', '⚠️', '🚸', '⛔️', '🚫', '🚳', '🚭', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉️', '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '⛎', '🔀', '🔁', '🔂', '▶️', '⏩', '⏭️', '⏯️', '◀️', '⏪', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '📳', '📴', '♀️', '♂️', '⚧️', '✨', '⭐️', '💫', '💥', '💢', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🏃‍♂️', '🏃‍♀️', '🚶‍♂️', '🚶‍♀️', '💃', '🕺', '🕴️', '👫', '👬', '👭', '💏', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩', '💑', '👨‍❤️‍👨', '👩‍❤️‍👩', '👪', '🗣️', '👤', '👥', '🫂', '👣', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐊', '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🎋', '🎍', '🌾', '🌿', '🍄', '🌰', '🦋', '🐛', '🐜', '🐝', '🐞', '🐌', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🎋', '🎍', '🌾', '🌿', '🍄', '🌰', '🦋', '🐛', '🐜', '🐝', '🐞', '🐌', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🍎', '🍌', '🍊', '🍋', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥙', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕️', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂', '⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳️', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♂️', '🏋️‍♀️', '🤼‍♂️', '🤼‍♀️', '🤸‍♂️', '🤸‍♀️', '⛹️‍♂️', '⛹️‍♀️', '🏌️‍♂️', '🏌️‍♀️', '🏇', '🧘‍♂️', '🧘‍♀️', '🏃‍♂️', '🏃‍♀️', '🚶‍♂️', '🚶‍♀️', '💃', '🕺', '🕴️', '👫', '👬', '👭', '💏', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩', '💑', '👨‍❤️‍👨', '👩‍❤️‍👩', '👪', '🗣️', '👤', '👥', '🫂', '👣', '🏃‍♂️', '🏃‍♀️', '🚶‍♂️', '🚶‍♀️', '💃', '🕺', '🕴️', '👫', '👬', '👭', '💏', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩', '💑', '👨‍❤️‍👨', '👩‍❤️‍👩', '👪', '🗣️', '👤', '👥', '🫂', '👣']

  // Track previous messages count for new message detection
  const [previousMessagesCount, setPreviousMessagesCount] = useState(0)

  // Debug logging for data changes and new messages detection
  useEffect(() => {
    console.log('MessagesTab data updated:', messagesData?.conversations?.length, 'conversations')
    console.log('Messages data:', messagesData)

    // Підраховуємо загальну кількість повідомлень
    const totalMessages = messagesData?.conversations?.reduce((total, conv) => total + conv.messages.length, 0) || 0

    // Перевіряємо, чи з'явилися нові повідомлення
    if (totalMessages > previousMessagesCount && previousMessagesCount > 0) {
      const newMessages = totalMessages - previousMessagesCount
      console.log(`New messages received: ${newMessages}`)
      setNewMessageCount(prev => prev + newMessages)
      setShowNewMessageToast(true)

      // Спробуємо відтворити звук нового повідомлення
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DhE=')
        audio.volume = 0.3
        audio.play().catch(() => {}) // Ігноруємо помилки, якщо звук вимкнений
      } catch (error) {
        // Ігноруємо помилки звуку
      }

      // Автоматично ховаємо toast через 3 секунди
      setTimeout(() => {
        setShowNewMessageToast(false)
        setNewMessageCount(0)
      }, 3000)
    }

    setPreviousMessagesCount(totalMessages)

    if (selectedConversation) {
      const currentConv = messagesData?.conversations?.find(c =>
        c.property.id === selectedConversation.property.id &&
        c.otherUser.id === selectedConversation.otherUser.id
      )
      console.log('Current conversation messages:', currentConv?.messages?.length)

      // Оновлюємо selectedConversation при зміні даних
      if (currentConv && JSON.stringify(currentConv) !== JSON.stringify(selectedConversation)) {
        console.log('Updating selected conversation')
        setSelectedConversation(currentConv)
      }
    }
  }, [messagesData, selectedConversation, previousMessagesCount])

  // Auto-select conversation if initialPropertyId is provided
  useEffect(() => {
    if (initialPropertyId && messagesData?.conversations && !selectedConversation) {
      const conversation = messagesData.conversations.find(
        (conv) => conv.property.id === initialPropertyId
      )
      if (conversation) {
        setSelectedConversation(conversation)
        // Mark unread messages as read
        conversation.messages.forEach((message) => {
          if (message.receiverId === user?.id && !message.isRead) {
            onMarkAsRead(message.id)
          }
        })
      } else if (initialProperty && initialProperty.host) {
        // Create virtual conversation if none exists
        const virtualConversation = {
          property: {
            id: initialProperty.id,
            title: initialProperty.title
          },
          otherUser: {
            id: initialProperty.host.id,
            email: initialProperty.host.email
          },
          messages: [],
          unreadCount: 0,
          lastMessage: {
            content: 'Почніть розмову...',
            createdAt: new Date().toISOString()
          },
          isVirtual: true // Mark as virtual conversation
        }
        setSelectedConversation(virtualConversation)
      }
    }
  }, [initialPropertyId, messagesData, selectedConversation, user, onMarkAsRead, initialProperty])

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        console.log('Scrolled to bottom')
      }, 100)
    }
  }

  // Auto-scroll only when opening a conversation
  useEffect(() => {
    if (selectedConversation) {
      console.log('Opening conversation, scrolling to bottom')
      scrollToBottom()

      // Auto-focus input when conversation opens
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 200)
      }
    }
  }, [selectedConversation?.property.id, selectedConversation?.otherUser.id]) // Only when conversation changes

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)

    // Mark unread messages as read
    conversation.messages.forEach((message) => {
      if (message.receiverId === user?.id && !message.isRead) {
        onMarkAsRead(message.id)
      }
    })
  }

  const handlePhoneClick = async () => {
    if (!selectedConversation) return

    try {
      const response = await api.get(`/messages/user/${selectedConversation.otherUser.id}/phone`)
      setUserPhone(response.data.phone || 'Номер телефону не вказаний')
      setShowPhoneModal(true)
    } catch (error) {
      console.error('Error fetching phone number:', error)
      setUserPhone('Номер телефону не доступний')
      setShowPhoneModal(true)
    }
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']

      if (file.size > maxSize) {
        alert(`Файл ${file.name} занадто великий. Максимальний розмір: 10MB`)
        return false
      }

      if (!allowedTypes.includes(file.type)) {
        alert(`Тип файлу ${file.name} не підтримується`)
        return false
      }

      return true
    })

    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  // Check if user is near bottom of chat
  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      const isNear = distanceFromBottom < 100 // Within 100px of bottom
      setIsNearBottom(isNear)

      // Show scroll button if there are new messages and user is not near bottom
      setShowScrollToBottom(newMessageCount > 0 && !isNear)
    }
  }

  // Handle scroll events
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkIfNearBottom)
      return () => container.removeEventListener('scroll', checkIfNearBottom)
    }
  }, [newMessageCount])

  // Check when new messages arrive
  useEffect(() => {
    if (newMessageCount > 0) {
      checkIfNearBottom()
    }
  }, [newMessageCount])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedConversation) return

    const messageData = {
      receiverId: selectedConversation.otherUser.id,
      propertyId: selectedConversation.property.id,
      content: newMessage.trim(),
      attachments: selectedFiles
    }

    console.log('Sending message with data:', messageData);

    // Use the parent's sendMessage function
    onSendMessage(messageData)

    // Scroll to bottom after sending message
    setTimeout(() => scrollToBottom(), 100)

    setNewMessage('')
    setSelectedFiles([])
    inputRef.current?.focus()
  }

  // Filter conversations based on search
  const filteredConversations = messagesData?.conversations?.filter(conv =>
    conv.otherUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.property.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Вчора'
    } else if (days < 7) {
      return date.toLocaleDateString('uk-UA', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
    }
  }

  if (messagesLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-16rem)]  rounded-lg shadow-xl overflow-hidden transition-colors duration-300 relative">

      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} md:w-96 w-full flex-col border-r border-[var(--border-color)] transition-all`}>
        {/* Заголовок з градієнтом */}
        <div className="p-4 border-b border-[var(--border-color)]" style={{ backgroundColor: 'var(--accent-color)' }}>
          <h2 className="text-xl text-white mb-4">Повідомлення</h2>

          {/* Пошук */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Пошук розмов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: `1px solid var(--border-color)`,
                '--tw-ring-color': 'var(--accent-color)',
                '--tw-placeholder-color': 'var(--text-muted)'
              }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8" style={{ color: 'var(--text-secondary)' }}>
              <svg className="w-24 h-24 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-center">Немає повідомлень</p>
              <p className="text-sm text-center mt-2">Розпочніть розмову з власником нерухомості</p>
            </div>
          ) : (
            filteredConversations
              .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
              .map((conversation) => (
              <button
                key={`${conversation.property.id}-${conversation.otherUser.id}`}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full p-4 flex items-start gap-3 transition-all border-b ${
                  selectedConversation?.property.id === conversation.property.id
                    ? 'bg-[var(--bg-secondary)] border-l-4 border-l-[var(--accent-color)]'
                    : 'hover:bg-[var(--bg-secondary)]'
                }`}
                style={{ borderColor: 'var(--border-color)' }}
              >
                {/* Аватар */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    {(conversation.otherUser.name || conversation.otherUser.email).charAt(0).toUpperCase()}
                  </div>
                  {/* Онлайн індикатор */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ backgroundColor: 'var(--success-color)', borderColor: 'var(--bg-primary)' }}></div>
                </div>

                {/* Інформація про розмову */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {conversation.otherUser.name || conversation.otherUser.email.split('@')[0]}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {conversation.property.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {conversation.lastMessage?.content || 'Почніть розмову...'}
                    </p>
                    {isFetchingMessages && conversation === selectedConversation && (
                      <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Непрочитані */}
                  {conversation.unreadCount > 0 && (
                  <div className="flex-shrink-0 ml-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full animate-pulse">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                {/* Кнопка назад на мобільних */}
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </button>

                {/* Аватар і інфо */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    {(selectedConversation.otherUser.name || selectedConversation.otherUser.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>

              <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedConversation.otherUser.name || selectedConversation.otherUser.email.split('@')[0]}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {selectedConversation.property.title}
                </p>
                </div>
              </div>

              {/* Дії */}
              <div className="flex items-center gap-2">
              <button
                  onClick={handlePhoneClick}
                  className="p-2 rounded-lg transition-colors group hover:bg-[var(--bg-secondary)]"
                  title="Показати номер телефону"
                >
                  <Phone className="w-5 h-5 group-hover:text-[var(--accent-color)] transition-colors" style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 messages-container relative"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {selectedConversation.isVirtual ? (
                <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Це початок розмови. Напишіть перше повідомлення!</p>
                </div>
              ) : (
                selectedConversation.messages
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((message, index) => {
                    const isOwn = message.senderId === user?.id;
                    const showAvatar = index === 0 ||
                      selectedConversation.messages[index - 1].senderId !== message.senderId;

                    return (
                <div
                  key={message.id}
                        className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
                      >
                        {/* Аватар */}
                        {showAvatar ? (
                          <div className="w-8 h-8 flex-shrink-0">
                            {!isOwn && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">
                                {(selectedConversation.otherUser.name || selectedConversation.otherUser.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-8 h-8 flex-shrink-0"></div>
                        )}

                        {/* Повідомлення */}
                        <div className={`group relative max-w-[70%] ${message.isOptimistic ? 'opacity-70' : ''}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 shadow-sm ${
                              isOwn
                                ? 'rounded-br-sm'
                                : 'rounded-bl-sm'
                            }`}
                            style={{
                              backgroundColor: isOwn ? 'var(--accent-color)' : 'var(--bg-primary)',
                              color: isOwn ? 'white' : 'var(--text-primary)',
                              border: isOwn ? 'none' : `1px solid var(--border-color)`
                            }}
                          >
                            <p className="text-sm break-words">{message.content}</p>

                            {/* Attachments */}
                            {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment, attIndex) => (
                                  <div key={attIndex} className="flex items-center gap-2">
                                    {attachment.mimetype?.startsWith('image/') ? (
                                      <div className="relative">
                                        <img
                                          src={attachment.url}
                                          alt={attachment.originalName}
                                          className="max-w-48 max-h-32 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => window.open(attachment.url, '_blank')}
                                        />
                                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                          {attachment.originalName}
                                        </div>
                                      </div>
                                    ) : (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors max-w-xs"
                                      >
                                        <File className="w-4 h-4 text-[var(--accent-color)] flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <p className="text-xs text-[var(--text-primary)] truncate font-medium">
                                            {attachment.originalName}
                                          </p>
                                          <p className="text-xs text-[var(--text-muted)]">
                                            {(attachment.size / 1024).toFixed(1)} KB
                                          </p>
                                        </div>
                                        <Download className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Час і статус */}
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(message.createdAt).toLocaleTimeString('uk-UA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                            </span>
                            {isOwn && (
                              message.isRead ? (
                                <CheckCheck className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                              ) : (
                                <Check className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}

              {/* Індикатор друку */}
              {isSendingMessage && (
                <div className="flex items-end gap-2 animate-fadeIn">
                  <div className="w-8 h-8 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">
                      {(selectedConversation.otherUser.name || selectedConversation.otherUser.email).charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', border: `1px solid var(--border-color)` }}>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll to bottom button */}
              {showScrollToBottom && (
                <button
                  onClick={() => {
                    scrollToBottom()
                    setShowScrollToBottom(false)
                    setNewMessageCount(0)
                    setShowNewMessageToast(false)
                  }}
                  className="absolute bottom-16 right-4 bg-[var(--accent-color)] text-white rounded-full p-3 shadow-lg hover:bg-[var(--accent-hover)] transition-colors animate-bounce-gentle z-10"
                  title={`Нові повідомлення (${newMessageCount})`}
                >
                  <ChevronLeft className="w-5 h-5 rotate-90" />
                  {newMessageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {newMessageCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t relative" style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)'
            }}>
              {/* File Preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg px-3 py-2 border border-[var(--border-color)]">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-[var(--accent-color)]" />
                      ) : (
                        <File className="w-4 h-4 text-[var(--text-secondary)]" />
                      )}
                      <span className="text-sm text-[var(--text-primary)] truncate max-w-32">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-[var(--text-secondary)]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                {/* Кнопки додаткових дій */}
                <div className="flex gap-1 mb-2">
                </div>

                {/* Поле введення */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isSendingMessage ? "Надсилається..." : "Напишіть повідомлення..."}
                    disabled={isSendingMessage}
                    className="w-full px-4 py-3 pr-12 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: `1px solid var(--border-color)`,
                      '--tw-ring-color': 'var(--accent-color)',
                      '--tw-placeholder-color': 'var(--text-muted)'
                    }}
                  />

                  {/* Прихований input для файлів */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                  >
                    <Smile className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>

                {/* Кнопка відправки */}
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSendingMessage}
                  className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg p-3 max-w-xs max-h-48 overflow-y-auto z-50">
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.slice(0, 64).map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-8 h-8 hover:bg-[var(--bg-secondary)] rounded transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-color)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Виберіть розмову</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Оберіть розмову зліва, щоб почати спілкування</p>
            </div>
          </div>
        )}
      </div>

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Номер телефону</h3>
              <button
                onClick={() => setShowPhoneModal(false)}
                className="p-1 hover:bg-[var(--bg-secondary)] rounded transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="text-center">
              <Phone className="w-12 h-12 text-[var(--accent-color)] mx-auto mb-3" />
              <p className="text-[var(--text-primary)] font-medium mb-2">
                {selectedConversation?.otherUser?.name || selectedConversation?.otherUser?.email?.split('@')[0]}
              </p>
              <p className="text-2xl font-bold text-[var(--accent-color)] mb-4">
                {userPhone}
              </p>
              {userPhone && userPhone !== 'Номер телефону не вказаний' && userPhone !== 'Номер телефону не доступний' && (
                <button
                  onClick={() => window.open(`tel:${userPhone}`, '_self')}
                  className="w-full bg-[var(--accent-color)] text-white py-3 px-4 rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Подзвонити
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessagesTab
