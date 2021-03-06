import 'firebase/auth';
import 'firebase/storage';
import '@firebase/performance';
import React, { useState } from 'react';
import {
  SuspenseWithPerf,
  useStorageDownloadURL,
  useStorageTask,
  useFirebaseApp,
  AuthCheck
} from 'reactfire';

const DownloadImage = () => {
  const demoImagePath = 'Cloud Storage for Firebase (Independent Icon).png';
  const firebaseApp = useFirebaseApp();
  const ref = firebaseApp.storage().ref(demoImagePath);

  const downloadURL = useStorageDownloadURL(ref);

  return (
    <img
      src={downloadURL}
      alt="demo download"
      style={{ width: '200px', height: '200px' }}
    />
  );
};

const UploadProgress = ({ uploadTask, storageRef }) => {
  const { bytesTransferred, totalBytes } = useStorageTask(
    uploadTask,
    storageRef
  );

  const percentComplete =
    Math.round(100 * (bytesTransferred / totalBytes)) + '%';

  return <span>{percentComplete}</span>;
};

const ImageUploadButton = props => {
  const [uploadTask, setUploadTask] = useState(null);
  const [ref, setRef] = useState(null);
  const firebaseApp = useFirebaseApp();
  const onChange = event => {
    const fileList = event.target.files;
    const fileToUpload = fileList[0];
    const fileName = fileToUpload.name;
    const newRef = firebaseApp
      .storage()
      .ref('images')
      .child(fileName);
    setRef(newRef);

    const uploadTask = newRef.put(fileToUpload);

    uploadTask.then(() => {
      console.log('upload complete');
      setUploadTask(null);
    });
    setUploadTask(uploadTask);
  };

  return (
    <>
      <input type="file" accept="image/png, image/jpeg" onChange={onChange} />
      {uploadTask ? (
        <SuspenseWithPerf
          fallback="waiting for progress..."
          traceId="storage-upload"
        >
          <UploadProgress uploadTask={uploadTask} storageRef={ref} />
        </SuspenseWithPerf>
      ) : (
        ''
      )}
    </>
  );
};

const SuspenseWrapper = props => {
  return (
    <SuspenseWithPerf fallback="loading..." traceId="storage-root">
      <AuthCheck fallback="sign in to use Storage">
        <DownloadImage />
        <br />
        <ImageUploadButton />
      </AuthCheck>
    </SuspenseWithPerf>
  );
};

export default SuspenseWrapper;
