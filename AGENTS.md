# Architecture
- Client attachments use a private storage bucket and owner-scoped metadata with a composite client/owner foreign key; this prevents cross-account associations and public file access.
- Attachment files are downloaded as blobs rather than opened inline; arbitrary extensions must not execute in the application origin.