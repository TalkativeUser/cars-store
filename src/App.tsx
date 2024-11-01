/* eslint-disable react-hooks/exhaustive-deps */
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import CircleColor from "./components/CircleColor";
import ErrorMessage from "./components/ErrorMessage";
import ProductCard from "./components/ProductCard";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Modal from "./components/ui/Modal";
import { categories, colors, formInputsList, productList } from "./data";
import { IProduct } from "./interfaces";
import { productValidation } from "./validation";
import Select from "./components/ui/Select";
import { ProductNameTypes } from "./types";
import toast, { Toaster } from "react-hot-toast";

const App = () => {
  const defaultProductObj = {
    title: "",
    description: "",
    imageURL: "",
    price: "",
    colors: [],
    category: {
      name: "",
      imageURL: "",
    },
  };
  /* ------- STATE -------  */
  const [products, setProducts] = useState<IProduct[]>(productList);
  const [product, setProduct] = useState<IProduct>(defaultProductObj);
  const [productToEdit, setProductToEdit] = useState<IProduct>(defaultProductObj);
  const [productToEditIdx, setProductToEditIdx] = useState<number>(0);
  const [errors, setErrors] = useState({ title: "", description: "", imageURL: "", price: "" });
  const [tempColors, setTempColor] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  /* ------- HANDLER -------  */
  const closeModal = useCallback(() => setIsOpen(false),[])
  const openModal = useCallback(() => setIsOpen(true),[])
  const closeEditModal = () => setIsOpenEditModal(false);
  const openEditModal = useCallback(() => setIsOpenEditModal(true),[])
  const closeConfirmModal = () => setIsOpenConfirmModal(false);
  const openConfirmModal = useCallback(() => setIsOpenConfirmModal(true),[])


//  الافضل اننا نلغى الفانكشن دى ونستخدم ال  useRef  فى الفانكشن بتاعة ال submit  علطول 

    const onChangeHandler = useCallback ((event: ChangeEvent<HTMLInputElement>) => {
            const { value, name } = event.target;



            // setProduct({       لو كنا سسبنا الكود المتهمش ده ومحطيناش حاجه فى الديبندانثى ليست كان كل مره هيحصل استدعاء لهذه الفانكشن
            //   ...product,      كانت هتديك اول قيمه هى شافتها للبرودكت والايرورز برضه وهتضيفلك عليهم القيمه بتاعة الحقل الجديده وخلاص ولو 
            //   [name]: value,   انا كنت كاتب اى قيمه فى اى حقل قديم هتضيع لان لما بكتب اى حرف البرودكت بيتملى بالقيم الاولى اللى شافها اول مره
            // });                اللى هى تعتبر ال  defaultProductObj  وبيزود عليها قيمة الحقل اللى بيتكتب فيه ولو عاوز تجرب وتشوف بعينك 
            // setErrors({        شغل الكود ده ومتحطش حاجه فى ال  dependancy list 
            //   ...errors,       الحل فى اننا نستخدم ال  prev value  ودى حلاوتها انها بتجيب القيمه السابقه من ال state  اللى هى شغاله عليها
            //   [name]: "",      انما فى الحاله دى اللى احنا مهمشينها هو بيروح لل  product  اللى شافه اول مره ويجبلك القيم بتاعته ويضيفلك 
            // });                قيمه الحقل الجديده وخلاص , على فكره الكود ده يشتغل عادى لكن لو ال  product  شغاله على ححقل واحد فقط 

//   طب لو كنا سيبنا الكود المتهمش وحطينا فى ال  dependancy list  البرودكت والايرورز اى اللى كان هيحصل ؟؟؟
//  بكل بساطه مع كل حرف بيتكتب فى اى  input  الفانكشن دى هيحصلها  recreation  وبكده مع كل حرف بيتكتب ال  props  المبعوته لل  inp comp 
//  هيتحسب كده انها اتغيرت لان حصلها  recreatetion وبالتالى اى   input comp  واخد الفانكشن دى فى البروبس هيحصله  reRender  بسببها مع كل 
//  حرف بيتكتب وده اكبر غلط وكده اصلا يبقا احنا ما عملناش اى  optmization  خالص 


            setProduct( prev => ( {...prev, [name]:value} ) );

            setErrors(prev =>({...prev,[name]:''}));





          }   ,  [])

  const onChangeEditHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setProductToEdit({
      ...productToEdit,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const onCancel = () => {
    setProduct(defaultProductObj);
    closeEditModal();
  };

  const removeProductHandler = () => {
    const filtered = products.filter(product => product.id !== productToEdit.id);
    setProducts(filtered);
    closeConfirmModal();
    toast("Product has been deleted successfully!", {
      icon: "👏",
      style: {
        backgroundColor: "#c2344d",
        color: "white",
      },
    });
  };

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const { title, description, price, imageURL } = product;

    const errors = productValidation({
      title,
      description,
      price,
      imageURL,
    });

    const hasErrorMsg =
      Object.values(errors).some(value => value === "") && Object.values(errors).every(value => value === "");

    if (!hasErrorMsg) {
      setErrors(errors);
      return;
    }

    setProducts(prev => [{ ...product, id: uuid(), colors: tempColors, category: selectedCategory }, ...prev]);
    setProduct(defaultProductObj);
    setTempColor([]);
    closeModal();

    toast("Product has been added successfully!", {
      icon: "👏",
      style: {
        backgroundColor: "black",
        color: "white",
      },
    });
  };

  const submitEditHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const { title, description, price, imageURL } = productToEdit;

    const errors = productValidation({
      title,
      description,
      price,
      imageURL,
    });

    const hasErrorMsg =
      Object.values(errors).some(value => value === "") && Object.values(errors).every(value => value === "");

    if (!hasErrorMsg) {
      setErrors(errors);
      return;
    }

    const updatedProducts = [...products];
    updatedProducts[productToEditIdx] = { ...productToEdit, colors: tempColors.concat(productToEdit.colors) };
    setProducts(updatedProducts);

    setProductToEdit(defaultProductObj);
    setTempColor([]);
    closeEditModal();

    toast("Product has been updated successfully!", {
      icon: "👏",
      style: {
        backgroundColor: "black",
        color: "white",
      },
    });
  };

  /* ------- RENDER -------  */
  const renderProductList = products.map((product, idx:number) => (
    <ProductCard
      key={product.id}
      product={product} 
      setProductToEdit={setProductToEdit}
      openEditModal={openEditModal} 
      idx={idx}
      setProductToEditIdx={setProductToEditIdx}
      openConfirmModal={openConfirmModal} 
    />
  ));
  const renderFormInputList = formInputsList.map(input => (
    <div className="flex flex-col" key={input.id}>
      <label htmlFor={input.id} className="mb-[2px] text-sm font-medium text-gray-700">
        {input.label}
      </label>
      <Input type="text" onChange={onChangeHandler} value={product[input.name]}  id={input.id} name={input.name}  />
    
      
      <ErrorMessage msg={errors[input.name]} />
    </div>
  ));

  const renderProductColors = colors.map(color => (
    <CircleColor
      key={color}
      color={color}

      
      onClick={() => {


        if (tempColors.includes(color)) {
          setTempColor(prev => prev.filter(item => item !== color));
          return;
        }

        if (productToEdit.colors.includes(color)) {
          setTempColor(prev => prev.filter(item => item !== color));
          return;
        }


        setTempColor(prev => [...prev, color]);


      }}


    />
  ));







  const renderProductEditWithErrorMsg = (id: string, label: string, name: ProductNameTypes) => {
    return (
      <div className="flex flex-col">
        <label htmlFor={id} className="mb-[2px] text-sm font-medium text-gray-700">
          {label}
        </label>
        <Input type="text" id={id} name={name} value={productToEdit[name]} onChange={onChangeEditHandler} />
        <ErrorMessage msg={errors[name]} />
      </div>
    )
  }
  useEffect(()=>{

console.log('product testing now ',product);



  },[product])

  return (
    <main className="container">
      <Button
        className="block bg-indigo-700 hover:bg-indigo-800 mx-auto my-10 px-10 font-medium"
        onClick={openModal}
        width="w-fit"
      >
        Build a Product
      </Button>

      <div className="m-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 p-2 rounded-md">
        {renderProductList}
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal isOpen={isOpen} closeModal={closeModal} title="ADD A NEW PRODUCT">
        <form className="space-y-3" onSubmit={submitHandler}>
          {renderFormInputList}
          <Select selected={selectedCategory} setSelected={setSelectedCategory} />
          <div className="flex items-center flex-wrap space-x-1">{renderProductColors}</div>
          <div className="flex items-center flex-wrap space-x-1">
            {tempColors.map(color => (
              <span
                key={color}
                className="p-1 mr-1 mb-1 text-xs rounded-md text-white"
                style={{ backgroundColor: color }}
              >
                {color}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Button className="bg-indigo-700 hover:bg-indigo-800">Submit</Button>
            <Button type="button" className="bg-[#f5f5fa] hover:bg-gray-300 !text-black" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal isOpen={isOpenEditModal} closeModal={closeEditModal} title="EDIT THIS PRODUCT">
        <form className="space-y-3" onSubmit={submitEditHandler}>
          {renderProductEditWithErrorMsg("title", "Product Title", "title")}
          {renderProductEditWithErrorMsg("description", "Product Description", "description")}
          {renderProductEditWithErrorMsg("imageURL", "Product Image URL", "imageURL")}
          {renderProductEditWithErrorMsg("price", "Product Price", "price")}

          <Select
            selected={productToEdit.category}
            setSelected={value => setProductToEdit({ ...productToEdit, category: value })}
          />

          <div className="flex items-center flex-wrap space-x-1">{renderProductColors}</div>
          <div className="flex items-center flex-wrap space-x-1">
            {tempColors.concat(productToEdit.colors).map(color => (
              <span
                key={color}
                className="p-1 mr-1 mb-1 text-xs rounded-md text-white"
                style={{ backgroundColor: color }}
              >
                {color}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Button className="bg-indigo-700 hover:bg-indigo-800">Submit</Button>
            <Button type="button" className="bg-[#f5f5fa] hover:bg-gray-300 !text-black" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE PRODUCT CONFIRM MODAL */}
      <Modal
        isOpen={isOpenConfirmModal}
        closeModal={closeConfirmModal}
        title="Are you sure you want to remove this Product from your Store?"
        description="Deleting this product will remove it permanently from your inventory. Any associated data, sales history, and other related information will also be deleted. Please make sure this is the intended action."
      >
        <div className="flex items-center space-x-3">
          <Button className="bg-[#c2344d] hover:bg-red-800" onClick={removeProductHandler}>
            Yes, remove
          </Button>
          <Button type="button" className="bg-[#f5f5fa] hover:bg-gray-300 !text-black" onClick={closeConfirmModal}>
            Cancel
          </Button>
        </div>
      </Modal>

      <Toaster />
    </main>
  );
};

export default App;


