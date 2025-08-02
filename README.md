| Multer Method                        | File Location        |
| ------------------------------------ | -------------------- |
| `upload.single('video')`             | `req.file`           |
| `upload.array('images')`             | `req.files`          |
| `upload.fields([{ name: 'video' }])` | `req.files.video[0]` |
