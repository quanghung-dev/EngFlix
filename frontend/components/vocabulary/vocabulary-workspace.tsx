"use client"

import { useCallback, useMemo, useRef, useState, useEffect } from "react"
import Link from "next/link"
import { Brain, LogIn, Plus } from "lucide-react"

import { ProductPageHeader } from "@/components/product/page-header"
import { ProductReveal } from "@/components/product/product-reveal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import {
  addVocabularyItem,
  createVocabularyDeck,
  deleteVocabularyDeck,
  deleteVocabularyItem,
  getMyVocabularyDecks,
  getVocabularyCategories,
  getVocabularyDecks,
  getVocabularyItems,
  updateVocabularyDeck,
  updateVocabularyItem,
} from "@/services/vocabulary.service"
import { DeckFormDialog, type DeckFormValues } from "@/components/vocabulary/deck-form-dialog"
import { FlashcardStudy } from "@/components/vocabulary/flashcard-study"
import { ItemFormDialog, type ItemFormValues } from "@/components/vocabulary/item-form-dialog"
import { VocabularyBrowser, type VocabularyTab } from "@/components/vocabulary/vocabulary-browser"
import { VocabularyDeckDetail } from "@/components/vocabulary/vocabulary-deck-detail"
import type { VocabularyCategoryType, VocabularyDeckType, VocabularyItemType } from "@/types/vocabulary"

type Feedback = { tone: "success" | "error"; message: string } | null

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { error?: { message?: unknown } } } }).response
    const message = response?.data?.error?.message
    if (typeof message === "string" && message.trim()) return message
  }

  return error instanceof Error && error.message ? error.message : fallback
}

export function VocabularyWorkspace() {
  const { user, resolved, isAuthenticated } = useAuthenticatedUser({ required: false })
  const libraryRequestId = useRef(0)
  const mineRequestId = useRef(0)
  const itemsRequestId = useRef(0)

  const [activeTab, setActiveTab] = useState<VocabularyTab>("library")
  const [categories, setCategories] = useState<VocabularyCategoryType[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [libraryDecks, setLibraryDecks] = useState<VocabularyDeckType[]>([])
  const [myDecks, setMyDecks] = useState<VocabularyDeckType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [mineLoading, setMineLoading] = useState(false)
  const [libraryError, setLibraryError] = useState<string | null>(null)
  const [mineError, setMineError] = useState<string | null>(null)
  const [categoryNotice, setCategoryNotice] = useState<string | null>(null)

  const [activeDeck, setActiveDeck] = useState<VocabularyDeckType | null>(null)
  const [items, setItems] = useState<VocabularyItemType[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [itemsPage, setItemsPage] = useState(1)
  const [itemsTotalPages, setItemsTotalPages] = useState(1)

  const [deckDialogOpen, setDeckDialogOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<VocabularyDeckType | null>(null)
  const [deckFormPending, setDeckFormPending] = useState(false)
  const [deckFormError, setDeckFormError] = useState<string | null>(null)
  const [deleteDeckTarget, setDeleteDeckTarget] = useState<VocabularyDeckType | null>(null)
  const [pendingDeckId, setPendingDeckId] = useState<number | null>(null)
  const [deleteDeckError, setDeleteDeckError] = useState<string | null>(null)

  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<VocabularyItemType | null>(null)
  const [itemFormPending, setItemFormPending] = useState(false)
  const [itemFormError, setItemFormError] = useState<string | null>(null)
  const [deleteItemTarget, setDeleteItemTarget] = useState<VocabularyItemType | null>(null)
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const [deleteItemError, setDeleteItemError] = useState<string | null>(null)

  const [studyMode, setStudyMode] = useState(false)
  const [studyItems, setStudyItems] = useState<VocabularyItemType[]>([])
  const [studyPending, setStudyPending] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const loadLibrary = useCallback(async (categoryId: number | null, includeCategories = false) => {
    const requestId = ++libraryRequestId.current
    setLibraryLoading(true)
    setLibraryError(null)
    if (includeCategories) setCategoryNotice(null)

    const [decksResult, categoriesResult] = await Promise.allSettled([
      getVocabularyDecks({ category_id: categoryId ?? undefined, limit: 60 }),
      includeCategories ? getVocabularyCategories() : Promise.resolve(null),
    ])

    if (requestId !== libraryRequestId.current) return

    if (decksResult.status === "fulfilled") {
      setLibraryDecks(decksResult.value.data ?? [])
    } else {
      setLibraryError(
        getErrorMessage(decksResult.reason, "Không thể tải các bộ từ mặc định. Vui lòng thử lại.")
      )
    }

    if (includeCategories && categoriesResult.status === "fulfilled" && categoriesResult.value) {
      setCategories(categoriesResult.value.data ?? [])
    } else if (includeCategories && categoriesResult.status === "rejected") {
      setCategories([])
      setCategoryNotice("Danh mục tạm thời chưa tải được. Bạn vẫn có thể xem toàn bộ thư viện bên dưới.")
    }

    setLibraryLoading(false)
  }, [])

  const loadMine = useCallback(async () => {
    const requestId = ++mineRequestId.current
    setMineLoading(true)
    setMineError(null)

    try {
      const response = await getMyVocabularyDecks({ limit: 100 })
      if (requestId !== mineRequestId.current) return
      setMyDecks(response.data ?? [])
    } catch (error) {
      if (requestId !== mineRequestId.current) return
      setMineError(getErrorMessage(error, "Không thể tải các bộ từ cá nhân. Vui lòng thử lại."))
    } finally {
      if (requestId === mineRequestId.current) setMineLoading(false)
    }
  }, [])

  const loadItems = useCallback(async (deck: VocabularyDeckType, page: number) => {
    const requestId = ++itemsRequestId.current
    setItemsLoading(true)
    setItemsError(null)

    try {
      const response = await getVocabularyItems(deck.id, { page, limit: 25 })
      if (requestId !== itemsRequestId.current) return
      setItems(response.data ?? [])
      setItemsPage(response.meta?.page ?? page)
      setItemsTotalPages(Math.max(1, response.meta?.total_pages ?? 1))
    } catch (error) {
      if (requestId !== itemsRequestId.current) return
      setItems([])
      setItemsError(getErrorMessage(error, "Không thể tải nội dung của bộ từ này."))
    } finally {
      if (requestId === itemsRequestId.current) setItemsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!resolved) return
    const kickoff = window.setTimeout(() => {
      void loadLibrary(null, true)
      if (user) {
        void loadMine()
      } else {
        mineRequestId.current += 1
        setMyDecks([])
        setMineError(null)
        setMineLoading(false)
      }
    }, 0)
    return () => {
      window.clearTimeout(kickoff)
      libraryRequestId.current += 1
      mineRequestId.current += 1
      itemsRequestId.current += 1
    }
  }, [loadLibrary, loadMine, resolved, user])

  const activeCategoryName = useMemo(
    () => categories.find((category) => category.id === activeDeck?.category_id)?.name,
    [activeDeck?.category_id, categories]
  )
  const isActiveDeckOwner = Boolean(
    user && activeDeck && !activeDeck.is_default && activeDeck.user_id === user.uid
  )

  function handleCategoryChange(categoryId: number | null) {
    setSelectedCategory(categoryId)
    void loadLibrary(categoryId)
  }

  function handleOpenDeck(deck: VocabularyDeckType) {
    setActiveDeck(deck)
    setStudyMode(false)
    setStudyItems([])
    setFeedback(null)
    void loadItems(deck, 1)
  }

  function handleBackToBrowser() {
    itemsRequestId.current += 1
    setActiveDeck(null)
    setItems([])
    setItemsError(null)
    setStudyMode(false)
    setStudyItems([])
  }

  function openCreateDeck() {
    if (!isAuthenticated) return
    setEditingDeck(null)
    setDeckFormError(null)
    setDeckDialogOpen(true)
  }

  function openEditDeck(deck: VocabularyDeckType) {
    if (!user || deck.is_default || deck.user_id !== user.uid) return
    setEditingDeck(deck)
    setDeckFormError(null)
    setDeckDialogOpen(true)
  }

  async function handleDeckSubmit(values: DeckFormValues) {
    setDeckFormPending(true)
    setDeckFormError(null)

    try {
      if (editingDeck) {
        const response = await updateVocabularyDeck(editingDeck.id, values)
        const updated = response.data
        setMyDecks((decks) => decks.map((deck) => (deck.id === updated.id ? updated : deck)))
        setActiveDeck((deck) => (deck?.id === updated.id ? updated : deck))
        setFeedback({ tone: "success", message: "Đã cập nhật bộ từ." })
      } else {
        const response = await createVocabularyDeck(values)
        setMyDecks((decks) => [response.data, ...decks])
        setActiveTab("mine")
        setFeedback({ tone: "success", message: "Bộ từ mới đã được tạo." })
      }
      setDeckDialogOpen(false)
      setEditingDeck(null)
    } catch (error) {
      setDeckFormError(getErrorMessage(error, "Không thể lưu bộ từ. Nội dung bạn nhập vẫn được giữ lại."))
    } finally {
      setDeckFormPending(false)
    }
  }

  async function confirmDeleteDeck() {
    if (!deleteDeckTarget) return
    setPendingDeckId(deleteDeckTarget.id)
    setDeleteDeckError(null)

    try {
      await deleteVocabularyDeck(deleteDeckTarget.id)
      setMyDecks((decks) => decks.filter((deck) => deck.id !== deleteDeckTarget.id))
      if (activeDeck?.id === deleteDeckTarget.id) handleBackToBrowser()
      setFeedback({ tone: "success", message: `Đã xóa bộ từ “${deleteDeckTarget.name}”.` })
      setDeleteDeckTarget(null)
    } catch (error) {
      setDeleteDeckError(getErrorMessage(error, "Không thể xóa bộ từ này."))
    } finally {
      setPendingDeckId(null)
    }
  }

  function openAddItem() {
    if (!isActiveDeckOwner) return
    setEditingItem(null)
    setItemFormError(null)
    setItemDialogOpen(true)
  }

  function openEditItem(item: VocabularyItemType) {
    if (!isActiveDeckOwner) return
    setEditingItem(item)
    setItemFormError(null)
    setItemDialogOpen(true)
  }

  async function handleItemSubmit(values: ItemFormValues) {
    if (!activeDeck || !isActiveDeckOwner) return
    setItemFormPending(true)
    setItemFormError(null)

    try {
      if (editingItem) {
        const response = await updateVocabularyItem(activeDeck.id, editingItem.id, values)
        setItems((currentItems) =>
          currentItems.map((item) => (item.id === response.data.id ? response.data : item))
        )
        setFeedback({ tone: "success", message: `Đã cập nhật “${response.data.phrase}”.` })
      } else {
        const response = await addVocabularyItem(activeDeck.id, values)
        if (itemsPage === itemsTotalPages && items.length < 25) {
          setItems((currentItems) => [...currentItems, response.data])
        } else {
          await loadItems(activeDeck, itemsPage)
        }
        setFeedback({ tone: "success", message: `Đã thêm “${response.data.phrase}” vào bộ từ.` })
      }
      setItemDialogOpen(false)
      setEditingItem(null)
    } catch (error) {
      setItemFormError(getErrorMessage(error, "Không thể lưu từ vựng. Nội dung bạn nhập vẫn được giữ lại."))
    } finally {
      setItemFormPending(false)
    }
  }

  async function confirmDeleteItem() {
    if (!activeDeck || !deleteItemTarget || !isActiveDeckOwner) return
    setPendingItemId(deleteItemTarget.id)
    setDeleteItemError(null)

    try {
      await deleteVocabularyItem(activeDeck.id, deleteItemTarget.id)
      const nextPage = items.length === 1 && itemsPage > 1 ? itemsPage - 1 : itemsPage
      await loadItems(activeDeck, nextPage)
      setFeedback({ tone: "success", message: `Đã xóa “${deleteItemTarget.phrase}”.` })
      setDeleteItemTarget(null)
    } catch (error) {
      setDeleteItemError(getErrorMessage(error, "Không thể xóa từ vựng này."))
    } finally {
      setPendingItemId(null)
    }
  }

  async function startStudy() {
    if (!activeDeck) return
    setStudyPending(true)
    setFeedback(null)

    try {
      const response = await getVocabularyItems(activeDeck.id)
      if (!response.data.length) {
        setFeedback({ tone: "error", message: "Bộ từ chưa có nội dung để bắt đầu flashcard." })
        return
      }
      setStudyItems(response.data)
      setStudyMode(true)
    } catch (error) {
      setFeedback({ tone: "error", message: getErrorMessage(error, "Không thể chuẩn bị flashcard.") })
    } finally {
      setStudyPending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <ProductReveal eager>
        <ProductPageHeader
          actions={
            <>
              {isAuthenticated ? (
                <Button variant="product" size="app" onClick={openCreateDeck}>
                  <Plus aria-hidden="true" />
                  Tạo bộ từ cá nhân
                </Button>
              ) : (
                <Button nativeButton={false} render={<Link href="/login" />} variant="product" size="app">
                  <LogIn aria-hidden="true" />
                  Đăng nhập để tạo bộ từ
                </Button>
              )}
              <Button nativeButton={false} render={<Link href={isAuthenticated ? "/vocabulary/quiz" : "/login"} />} variant="glass" size="app">
                <Brain aria-hidden="true" />
                Luyện quiz
              </Button>
            </>
          }
        />
      </ProductReveal>

      {feedback && (
        <p
          role={feedback.tone === "error" ? "alert" : "status"}
          className={`mt-7 rounded-control border p-4 text-sm leading-6 ${
            feedback.tone === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-status-success/25 bg-status-success/10 text-status-success"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <div className="mt-10">
        {activeDeck ? (
          studyMode ? (
            <FlashcardStudy deckName={activeDeck.name} items={studyItems} onExit={() => setStudyMode(false)} />
          ) : (
            <VocabularyDeckDetail
              deck={activeDeck}
              categoryName={activeCategoryName}
              items={items}
              loading={itemsLoading}
              error={itemsError}
              isOwner={isActiveDeckOwner}
              page={itemsPage}
              totalPages={itemsTotalPages}
              pendingDeckId={pendingDeckId}
              pendingItemId={pendingItemId}
              studyPending={studyPending}
              onBack={handleBackToBrowser}
              onRetry={() => void loadItems(activeDeck, itemsPage)}
              onPageChange={(page) => void loadItems(activeDeck, page)}
              onStartStudy={() => void startStudy()}
              onAddItem={openAddItem}
              onEditDeck={() => openEditDeck(activeDeck)}
              onDeleteDeck={() => {
                setDeleteDeckError(null)
                setDeleteDeckTarget(activeDeck)
              }}
              onEditItem={openEditItem}
              onDeleteItem={(item) => {
                setDeleteItemError(null)
                setDeleteItemTarget(item)
              }}
            />
          )
        ) : (
          <ProductReveal delay={0.07}>
            <VocabularyBrowser
              activeTab={activeTab}
              onTabChange={setActiveTab}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              libraryDecks={libraryDecks}
              myDecks={myDecks}
              libraryLoading={!resolved || libraryLoading}
              mineLoading={mineLoading}
              libraryError={libraryError}
              categoryNotice={categoryNotice}
              mineError={mineError}
              isAuthenticated={isAuthenticated}
              pendingDeckId={pendingDeckId}
              onRetryLibrary={() => void loadLibrary(selectedCategory, categories.length === 0)}
              onRetryMine={() => void loadMine()}
              onOpenDeck={handleOpenDeck}
              onCreateDeck={openCreateDeck}
              onEditDeck={openEditDeck}
              onDeleteDeck={(deck) => {
                setDeleteDeckError(null)
                setDeleteDeckTarget(deck)
              }}
            />
          </ProductReveal>
        )}
      </div>

      <DeckFormDialog
        open={deckDialogOpen}
        onOpenChange={(open) => {
          if (!deckFormPending) setDeckDialogOpen(open)
        }}
        categories={categories}
        initialDeck={editingDeck}
        pending={deckFormPending}
        error={deckFormError}
        onSubmit={handleDeckSubmit}
      />

      <ItemFormDialog
        open={itemDialogOpen}
        onOpenChange={(open) => {
          if (!itemFormPending) setItemDialogOpen(open)
        }}
        initialItem={editingItem}
        pending={itemFormPending}
        error={itemFormError}
        onSubmit={handleItemSubmit}
      />

      <AlertDialog
        open={Boolean(deleteDeckTarget)}
        onOpenChange={(open) => {
          if (!open && pendingDeckId === null) setDeleteDeckTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bộ từ “{deleteDeckTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả mục từ bên trong cũng sẽ bị xóa. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteDeckError && <p role="alert" className="text-sm text-destructive">{deleteDeckError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingDeckId !== null}>Giữ lại</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              size="app"
              disabled={pendingDeckId !== null}
              onClick={() => void confirmDeleteDeck()}
            >
              {pendingDeckId !== null ? "Đang xóa…" : "Xóa bộ từ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deleteItemTarget)}
        onOpenChange={(open) => {
          if (!open && pendingItemId === null) setDeleteItemTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa “{deleteItemTarget?.phrase}” khỏi bộ từ?</AlertDialogTitle>
            <AlertDialogDescription>
              Mục từ và ngữ cảnh đi kèm sẽ bị xóa vĩnh viễn khỏi bộ cá nhân này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteItemError && <p role="alert" className="text-sm text-destructive">{deleteItemError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingItemId !== null}>Giữ lại</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              size="app"
              disabled={pendingItemId !== null}
              onClick={() => void confirmDeleteItem()}
            >
              {pendingItemId !== null ? "Đang xóa…" : "Xóa từ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
