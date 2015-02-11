{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

import System.Environment
import System.FilePath
import System.Directory

import Control.Exception (catch, IOException)
import Debug.Trace
import Prelude hiding (readFile, writeFile, id)
import Data.Aeson (ToJSON, toJSON, FromJSON)
import qualified Data.Aeson as A
import Data.Text (Text, pack, unpack)
import Data.Text.Encoding (encodeUtf8, decodeUtf8)
import Data.List (stripPrefix)
import GHC.Generics
import Data.Time.Format
import Data.Time.Calendar
import System.Locale
import Control.Monad
import Control.Monad.IO.Class (liftIO)
import Control.Applicative ((<$>), pure, (<*>))
import Data.Monoid ((<>))
import Data.Maybe (fromJust, catMaybes)

import Network.Wai.Middleware.Static
import Web.Scotty
import Network.Wai.Parse

import Data.ByteString (ByteString)
import Data.ByteString.Lazy (readFile, writeFile)
import qualified Data.ByteString.Lazy as BL
import qualified Data.ByteString.Lazy.Char8 as BSLC
import qualified Data.ByteString.Char8 as BSC

import Vision.Image.Storage (loadBS, save)
import Vision.Image (RGB, convert, InterpolMethod(..), resize)
import Vision.Primitive.Shape
import Vision.Primitive (ix2, ix1)
import Vision.Image.Type (manifestSize)

dayFormat :: String
dayFormat = "%Y-%m-%d"

data EntryType = Moment | Book | Project 
  deriving (Show, Eq, Generic)

data Entry = Entry {
   date :: Maybe Day,
   entryType :: EntryType,
   name :: Text,
   id :: Text,
   image :: Text, -- not a url, just an image!
   comment :: Text,
   url :: Text
} deriving (Show, Generic)

instance ToJSON EntryType
instance FromJSON EntryType

instance ToJSON Entry
instance FromJSON Entry

instance ToJSON Day where
  toJSON day = toJSON $ formatDate day

instance FromJSON Day where
  parseJSON (A.String txt) = case (parseDate $ encodeUtf8 txt) of
                               Nothing -> mzero
                               Just d  -> pure d
  parseJSON _ = mzero

dataFolder :: FilePath
dataFolder = "data/entries/"

entriesPath :: FilePath
entriesPath = "data/entries.json"

-- the day is 10 chars long. If it's a prefix it'll parse
parseDate :: ByteString -> Maybe Day
parseDate = parseTime defaultTimeLocale dayFormat . take 10 . BSC.unpack

formatDate :: Day -> String
formatDate = formatTime defaultTimeLocale dayFormat

-- based on the original file name
-- eh, this sucks. I need to be able to do it from an entry too!
-- ok, given the name, predict it!
photoFilePath :: Entry -> FilePath
photoFilePath e = dataFolder <> unpack (image e)

-- based on the original file name
thumbFilePath :: Entry -> FilePath
thumbFilePath e = dataFolder <> unpack (id e) <> "-thumb.jpg"

saveFile :: Entry -> FileInfo BL.ByteString -> IO ()
saveFile e (FileInfo name tp content) = do
  -- save the original file
  let dest = photoFilePath e
  putStrLn $ "SAVING " <> dest
  writeFile dest content


saveThumbnail :: Entry -> FileInfo BL.ByteString -> IO ()
saveThumbnail e (FileInfo name tp content) = do
  res <- loadBS Nothing $ BL.toStrict content

  case res of
    Left err  -> putStrLn "Error Reading Image"
    Right img -> do
      let rgb = convert img :: RGB
          Z :. h :. w = manifestSize rgb
          small = resize Bilinear (thumbSize w h) rgb :: RGB

      save (thumbFilePath e) small
      return ()


thumbSize :: Int -> Int -> DIM2
thumbSize w h = ix2 h' w'
  where 
    w' = 400 :: Int
    h' = round $ (fromIntegral w') * (fromIntegral h / fromIntegral w) :: Int

-- will crash if the file name doesn't parse into a date
-- ok, so momentEntry is  is  is 
momentEntry :: FileInfo a -> Entry
momentEntry (FileInfo name tp _) = Entry {
    id = filename,
    date = parseDate name,
    entryType = Moment,
    name = "",
    image = decodeUtf8 name,
    comment = "",
    url = ""
  }
  where filename = pack $ dropExtension $ BSC.unpack name

entryPath :: Text -> FilePath
entryPath nm = dataFolder <> unpack nm <> ".json"

writeEntryFile :: Entry -> IO ()
writeEntryFile e = writeFile (entryPath (id e)) (A.encode e)

readEntryFile :: FilePath -> IO (Maybe Entry)
readEntryFile p = do
  c <- readFile p
  return $ A.decode c

deleteEntry :: Entry -> IO () 
deleteEntry e = do
  moveDeletedFile $ photoFilePath e
  moveDeletedFile $ thumbFilePath e
  moveDeletedFile $ entryPath (id e)

moveDeletedFile :: FilePath -> IO ()
moveDeletedFile p = do
  catch (renameFile p $ "data/deleted/" <> takeFileName p)
        (catchIOException)

catchIOException :: IOException -> IO ()
catchIOException e = putStrLn $ "ERROR " <> (show e)

saveIndex :: [Entry] -> IO ()
saveIndex es = do
  let s = A.encode es
  writeFile entriesPath s

loadIndex :: IO [Entry]
loadIndex = do
  paths <- getDirectoryContents dataFolder
  let entryPaths = map (dataFolder <>) $ filter ((== ".json").takeExtension) paths
  entries <- mapM readEntryFile entryPaths
  return $ catMaybes entries

generateIndex :: IO ()
generateIndex = loadIndex >>= saveIndex


-- requires a string -> string
removePrefix :: String -> Policy
removePrefix p = policy (stripPrefix p)

main :: IO ()
main = do
  putStrLn "PORT 3000"
  putStrLn "Woot"

  generateIndex

  scotty 3000 $ do

    -- I want to say: if it comes in as /timeline, look locally!
    middleware $ staticPolicy (noDots >-> removePrefix "timeline/" >-> addBase ".")

    get "/status" (text "OK")
    get "/" (redirect "/timeline/")
    get "/timeline"  (file "index.html")
    get "/test" (text "hello")

    post "/files" $ do
      fs <- files

      liftIO $ forM_ fs $ \(_, f) -> do
        let e = momentEntry f
        writeEntryFile e
        saveFile e f
        saveThumbnail e f
        generateIndex

      text "OK"

    put "/entries/:id" $ do
      entry <- jsonData
      liftIO $ do
        writeEntryFile entry
        generateIndex
      text "OK"

    delete "/entries/:id" $ do
      id <- param "id"
      liftIO $ do
        me <- readEntryFile (entryPath id)
        case me of
          Nothing -> return ()
          Just e  -> do
            deleteEntry e
            generateIndex
      text "OK"


    --get "/timeline"     (file "index.html")
