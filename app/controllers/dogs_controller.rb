class DogsController < ApplicationController
    before_action :set_dog, only: [:show, :edit, :update, :destroy]
    before_action :authenticate_user, except: [:show , :index]



  def index
    @dogs = Dog.all
  end

  def show
    end

  def new
    @dog = Dog.new
  end

  def edit
  end

  def create
  @dog = Dog.new(dog_params)
  @dog.user = current_user

  respond_to do |format|
    if @dog.save
      format.html { redirect_to @dog, notice: 'Dog was successfully created.' }
      format.json { render :show, status: :created, location: @dog }
    else
      format.html { render :new }
      format.json { render json: @dog.errors, status: :unprocessable_entity }
    end
  end
end

  def update
  respond_to do |format|
    if @dog.update(dog_params)
      format.html { redirect_to @dog, notice: 'Dog was successfully updated.' }
      format.json { render :show, status: :ok, location: @dog }
    else
      format.html { render :edit }
      format.json { render json: @dog.errors, status: :unprocessable_entity }
    end
  end
end


  def destroy
    @dog.destroy
    respond_to do |format|
      format.html { redirect_to dogs_url, notice: 'Dog was successfully destroyed.' }
      format.json { head :no_content }
    end
  end


  private
  # Use callbacks to share common setup or constraints between actions.
  def set_dog
    @dog = Dog.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def dog_params
    params.require(:dog).permit(:name, :age)
  end


end
