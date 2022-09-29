import "./App.css";
import * as THREE from "three";
import { Suspense, useState, useMemo, useRef } from "react";
import useStateSnapshots from "use-state-snapshots";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CameraControls from "camera-controls";
import { PerspectiveCamera } from "three";
import { FaceObject, face_Objects } from "./Models/Face/swatch";
import {
  BoyHairStyleObject,
  boyHairStyle_Objects,
} from "./Models/HairStyle/Boy/swatch";
import { BoyOption, boyFaceInactive } from "./Options/swatch";
import {
  BoyHairColorObject,
  boyHairColor_Objects,
} from "./Models/HairStyle/Boy/color";
import Lights from "./Models/Lights";
import BoyHairstyle from "./Models/HairStyle/Boy";
import Face from "./Models/Face";
import Loading from "./Loading/Loading";
import { ElementObject, elements_objects } from "./Elements/swatch";

CameraControls.install({ THREE });
extend({ CameraControls });

function Foo() {
  const { camera } = useThree();
  camera.rotation.order = "YXZ";
  console.log(camera.position);
}

function Controls({
  zoom,
  focus,
  clicked,
  setData,
  pos = new THREE.Vector3(),
  look = new THREE.Vector3(),
}) {
  const ref = useRef();
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  useFrame((state, delta) => {
    if (clicked) {
      pos.set(focus[zoom].x, focus[zoom].y, focus[zoom].z);
      look.set(focus[zoom].x, focus[zoom].y, focus[zoom].z - 2);

      state.camera.position.lerp(pos, 1);
      state.camera.updateProjectionMatrix();

      ref.current.setLookAt(
        state.camera.position.x,
        state.camera.position.y,
        state.camera.position.z,
        look.x,
        look.y,
        look.z,
        true
      );
      console.log("ENTERED");
      setData((prevState) => ({
        ...prevState,
        zoom: !clicked,
      }));
    }
    ref.current.update(delta);
  });
  return <cameraControls ref={ref} args={[camera, gl.domElement]} />;
}

function CameraHelper() {
  const camera = new PerspectiveCamera(60, 0.7134719790724953, 0.1, 1000);
  return (
    <group position={[0, 3.061616997868383e-16, 5]}>
      <cameraHelper args={[camera]} />
    </group>
  );
}

function Configurator({ history, checkGender }) {
  const focusPosition = [
    {
      x: 0.0653451230347078,
      y: 1.2835181387688754,
      z: 2.8239068138582737,
    },
    {
      x: 0,
      y: 0,
      z: 5,
    },
  ];

  console.log("RERENDERED CONFIGURATOR");

  const [state, setState, pointer, setPointer] = useStateSnapshots({
    appliedFace: "F1",
    appliedHairColor: null,
    appliedBoyHairStyle: "BHS2",
    colorBHS: null,
    textureBHS: null,
  },1000,10);

  const [data, setData] = useState({
    activeOption: 0,
    boyColorActive: false,
    activeElement: 0,
    zoom: false,
  })

  const hairColorChange = [
    {
      color: "#F2A97F",
    },
    {
      color: "#D85F52",
    },
    {
      color: "#D92E37",
    },
    {
      color: "#FC9736",
    },
    {
      color: "#F7BD69",
    },
    {
      color: "#A4D09C",
    },
    {
      color: "#4C8A67",
    },
  ];

  function handleColorChange(index) {
    let color;
    if (data.activeOption === 1) {
      color = hairColorChange[index];
    }
    if (data.activeOption === 7 || data.activeOption === 6) {
    }
    let new_mtl;

    if (color.texture) {
      let cur = color.texture;
      cur.repeat.set(color.size[0], color.size[1], color.size[2]);
      cur.wrapS = THREE.RepeatWrapping;
      cur.wrapT = THREE.RepeatWrapping;
      new_mtl = {
        map: cur,
        shininess: color.shininess ? color.shininess : 10,
      };

      if (data.activeOption === 1) {
        setState((prevState) => ({
          ...prevState,
          textureBHS: new_mtl,
          colorBHS: null,
        }));
      }
    } else {
      console.log("Entered");
      new_mtl = {
        color: color.color,
        shininess: color.shininess ? color.shininess : 10,
      };
      if (data.activeOption === 1) {
        setState((prevState) => ({
          ...prevState,
          colorBHS: new_mtl,
          textureBHS: null,
        }));
      }
    }
  }

  return (
    <>
      <div className="App">
        <div className="flex flex-col lg:flex-row h-screen">
          <div className="flex flex-row w-full h-1/2 lg:w-1/2  lg:h-full">
            <div className="flex flex-col w-1/6">
              <div>
                <button
                  onClick={() => {
                    setPointer(pointer - 1);
                  }}
                >
                  Undo
                </button>
                <button
                  onClick={() => {
                    setPointer(pointer + 1);
                  }}
                >
                  Redo
                </button>
              </div>
              <div className="icons">
                {elements_objects.map((options, index) => (
                  <ElementObject
                    key={index}
                    id={index}
                    options={options}
                    active={data.activeElement}
                    onClick={() => {
                      setData((prevState) => ({
                        ...prevState,
                        activeElement: index,
                        zoom: !data.zoom,
                      }));
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="w-4/6">
              <Suspense fallback={null}>
                <Canvas flat camera={{ fov: 60, near: 0.1, far: 1000 }}>
                  <Foo />
                  <CameraHelper />
                  <Suspense fallback={null}>
                    {/* <Suspense fallback={null}>
                      <Foo clicked={clicked} setClicked={setClicked} />
                    </Suspense> */}
                    <Suspense fallback={null}>
                      <Lights />
                    </Suspense>
                    <Suspense fallback={null}>
                      <Face appliedFace={state.appliedFace} />
                    </Suspense>
                    <Suspense fallback={null}>
                      <BoyHairstyle
                        appliedBoyHairStyle={state.appliedBoyHairStyle}
                        appliedFace={state.appliedFace}
                        textureBHS={state.textureBHS}
                        colorBHS={state.colorBHS}
                      />
                    </Suspense>
                    <Suspense fallback={null}>
                      <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                      />
                    </Suspense>
                  </Suspense>
                  {/* <CameraControls1 ref={cameraControls} /> */}
                  <Controls
                    zoom={data.activeElement}
                    focus={focusPosition}
                    clicked={data.zoom}
                    setData={setData}
                  />
                </Canvas>
              </Suspense>
            </div>
            <div className="relative w-1/6"></div>
          </div>
          <div className="lg:relative flex justify-center  w-full h-1/2 lg:h-full lg:w-1/2 ">
            <div className="lg:absolute lg:bottom-1/4 flex flex-col  h-full lg:h-4/6   w-full lg:w-1/2">
              <div className="title-bar rounded-t-3xl">
                <div className="font-sans p-4 m-2 h-16 text-3xl text-white ">
                  Choose what to change?
                </div>
              </div>
              <div className="options-bar p-1">
                <div className="flex flex-row">
                  {boyFaceInactive.map((options, index) => (
                    <BoyOption
                      key={index}
                      id={index}
                      options={options}
                      active={data.activeOption}
                      activeColor={data.boyColorActive}
                      onClick={() => {
                        setData((prevState) => ({
                          ...prevState,
                          activeOption: index,
                          boyColorActive: false,
                        }));
                      }}
                      colorChange={() => {
                        setData((prevState) => ({
                          ...prevState,
                          boyColorActive: true,
                        }));
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="objects-bar  h-screen">
                <div className=" flex flex-wrap">
                  {data.activeOption === 0 &&
                    face_Objects.map((options, index) => (
                      <FaceObject
                        key={index}
                        id={index}
                        active={state.appliedFace}
                        options={options}
                        onClick={() => {
                          setState((prevState) => ({
                            ...prevState,
                            appliedFace: options.alt_text,
                          }));
                        }}
                      />
                    ))}

                  {data.activeOption === 1 &&
                    !data.boyColorActive &&
                    boyHairStyle_Objects.map((options, index) => (
                      <BoyHairStyleObject
                        key={index}
                        id={index}
                        active={state.appliedBoyHairStyle}
                        options={options}
                        onClick={() => {
                          setState(prevState=>({
                            ...prevState,
                          appliedBoyHairStyle: options.alt_text,
                          }));
                        }}
                      />
                    ))}

                  {data.activeOption === 1 &&
                    data.boyColorActive &&
                    boyHairColor_Objects.map((options, index) => (
                      <BoyHairColorObject
                        key={index}
                        id={index}
                        active={state.appliedHairColor}
                        options={options}
                        onClick={() => handleColorChange(index)}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Loading />
    </>
  );
}

export default Configurator;
